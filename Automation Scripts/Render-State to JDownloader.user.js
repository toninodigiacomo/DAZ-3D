// ==UserScript==
// @name         Render-State to JDownloader
// @version      1.6.3
// @description  Automates link retrieval and sends direct MediaFire links to JDownloader
// @author       Gemini
// @match        *://render-state.to/*
// @match        *://*.mediafire.com/*
// @match        *://ouo.io/*
// @match        *://ouo.press/*
// @grant        GM_setClipboard
// @grant        window.close
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. GLOBAL INTERCEPTION: Redirect window.open to current tab
    window.open = function(url) {
        if (url) window.location.href = url;
        return null;
    };

    /**
     * Injects a function directly into the page's DOM to bypass Tampermonkey sandbox
     * This allows us to access native site functions like oItem()
     */
    function injectScript(fn) {
        const script = document.createElement('script');
        script.textContent = `(${fn.toString()})();`;
        document.documentElement.appendChild(script);
        script.remove();
    }

    // --- RENDER-STATE AUTOMATION ---
    if (window.location.host.includes('render-state.to')) {
        injectScript(function() {
            // Re-apply window.open hijack inside the page context
            window.open = function(url) { if (url) window.location.href = url; return null; };

            const rewriteLinks = () => {
                // Target MediaFire buttons specifically
                const mfLinks = document.querySelectorAll('a.btnd.ext-link');
                mfLinks.forEach(link => {
                    if (link.innerText.includes('MEDIAFIRE')) {
                        // Force link to open in the current tab
                        if (link.getAttribute('target') === '_blank') {
                            link.setAttribute('target', '_self');
                            link.setAttribute('rel', 'noopener noreferrer');
                        }
                        // Remove inline JS that might trigger popups/new tabs
                        link.removeAttribute('onclick');
                    }
                });
            };

            // Run link rewriter continuously every 500ms
            setInterval(rewriteLinks, 500);

            // Automation for intermediate steps
            setInterval(() => {
                // Step 2: "Process link" button
                const process = document.querySelector('.btn_down_text:not([data-done])');
                if (process && process.innerText.trim() === "Process link") {
                    process.setAttribute('data-done', 'true');
                    console.log("Clicking Process Link...");
                    process.click();
                    if (process.parentElement) process.parentElement.click();
                }

                // Step 3: "Download" button (wpsafe-link)
                const btnDownload = document.getElementById('wpsafe-link');
                if (btnDownload && !btnDownload.hasAttribute('data-done')) {
                    const span = btnDownload.querySelector('.btn_down_text');
                    if (span && span.innerText.trim() === "Download") {
                        btnDownload.setAttribute('data-done', 'true');
                        console.log("Triggering final Download link...");
                        if (typeof window.oItem === 'function') window.oItem();
                        else btnDownload.click();
                    }
                }
            }, 1000);
        });
    }

    // --- OUO.IO / OUO.PRESS AUTOMATION ---
    if (window.location.host.includes('ouo.')) {
        setInterval(() => {
            const btn = document.getElementById('btn-main') || document.getElementById('btn-submit');
            if (btn && !btn.hasAttribute('data-done')) {
                btn.setAttribute('data-done', 'true');
                console.log("Ouo.io redirect detected, waiting for click...");
                setTimeout(() => btn.click(), 1200);
            }
        }, 1000);
    }

    // --- MEDIAFIRE FINAL PAGE (Copy to JDownloader & Close) ---
    if (window.location.host.includes('mediafire.com')) {
        const checkMf = setInterval(() => {
            const finalBtn = document.querySelector('#downloadButton');
            if (finalBtn && !document.body.hasAttribute('data-copied')) {
                document.body.setAttribute('data-copied', 'true');

                const downloadLink = finalBtn.href;
                console.log("Link captured for JDownloader: " + downloadLink);

                // Copy to system clipboard
                GM_setClipboard(downloadLink);

                clearInterval(checkMf);
                // Close tab after 2.5 seconds
                setTimeout(() => {
                    console.log("Job done. Closing tab.");
                    window.close();
                }, 2500);
            }
        }, 1000);
    }
})();