// ==UserScript==
// @name         Render-State to JDownloader
// @version      1.5.0
// @match        *://render-state.to/*
// @match        *://*.mediafire.com/*
// @match        *://ouo.io/*
// @match        *://ouo.press/*
// @grant        GM_setClipboard
// @grant        window.close
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- FONCTION D'INJECTION (S'exécute "dans" la page sans blocage) ---
    function injectScript(fn) {
        const script = document.createElement('script');
        script.textContent = `(${fn.toString()})();`;
        document.documentElement.appendChild(script);
        script.remove();
    }

    // --- CODE POUR RENDER-STATE (Cliquage pur) ---
    if (window.location.host.includes('render-state.to')) {
        injectScript(function() {
            window.open = function(url) { if (url) window.location.href = url; return null; };

            setInterval(() => {
                // 1. Mediafire
                //const mf = document.querySelector('a.btnd.ext-link:not([data-done])');
                //if (mf && mf.innerText.includes('MEDIAFIRE')) {
                //    mf.setAttribute('data-done', 'true');
                //    if (mf.href) window.location.href = mf.href; else mf.click();
                //}

                // 2. Process
                const process = document.querySelector('.btn_down_text:not([data-done])');
                if (process && process.innerText.trim() === "Process link") {
                    process.setAttribute('data-done', 'true');
                    process.click();
                    if (process.parentElement) process.parentElement.click();
                }

                // 3. Download (Accès direct à oItem possible ici !)
                const btnDownload = document.getElementById('wpsafe-link');
                if (btnDownload && !btnDownload.hasAttribute('data-done')) {
                    const span = btnDownload.querySelector('.btn_down_text');
                    if (span && span.innerText.trim() === "Download") {
                        btnDownload.setAttribute('data-done', 'true');
                        if (typeof window.oItem === 'function') window.oItem();
                        else btnDownload.click();
                    }
                }
            }, 1000);
        });
    }

    // --- CODE POUR OUO.IO ---
    if (window.location.host.includes('ouo.')) {
        const runOuo = () => {
            const btn = document.getElementById('btn-main') || document.getElementById('btn-submit');
            if (btn && !btn.hasAttribute('data-done')) {
                btn.setAttribute('data-done', 'true');
                setTimeout(() => btn.click(), 1200);
            }
        };
        setInterval(runOuo, 1000);
    }

    // --- CODE POUR MEDIAFIRE (JDownloader + Fermeture) ---
    if (window.location.host.includes('mediafire.com')) {
        const checkMf = setInterval(() => {
            const finalBtn = document.querySelector('#downloadButton');
            if (finalBtn && !document.body.hasAttribute('data-copied')) {
                document.body.setAttribute('data-copied', 'true');
                GM_setClipboard(finalBtn.href);
                console.log("Lien copié !");
                clearInterval(checkMf);
                setTimeout(() => window.close(), 2500);
            }
        }, 1000);
    }
})();
