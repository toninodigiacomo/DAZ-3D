// ==UserScript==
// @name         Render-State to JDownloader
// @version      1.6.7
// @description  Automates link retrieval. Priority: MediaFire > Google Drive. Sends links to JDownloader.
// @author       Gemini
// @match        *://render-state.to/*
// @match        *://*.mediafire.com/*
// @match        *://drive.google.com/*
// @match        *://ouo.io/*
// @match        *://ouo.press/*
// @grant        GM_setClipboard
// @grant        window.close
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. GLOBAL INTERCEPTION
    window.open = function(url) {
        if (url) window.location.href = url;
        return null;
    };

    function injectScript(fn) {
        const script = document.createElement('script');
        script.textContent = `(${fn.toString()})();`;
        document.documentElement.appendChild(script);
        script.remove();
    }

    // --- AUTOMATISATION RENDER-STATE ---
    if (window.location.host.includes('render-state.to')) {
        injectScript(function() {
            window.open = function(url) { if (url) window.location.href = url; return null; };

            const findBestLinkAndClick = () => {
                const links = Array.from(document.querySelectorAll('a.btnd'));
                if (links.length === 0) return;

                // On cherche MediaFire en priorité
                let targetLink = links.find(l => l.innerText.toUpperCase().includes('MEDIAFIRE'));

                // Si pas de MediaFire, on cherche Google Drive
                if (!targetLink) {
                    targetLink = links.find(l => l.innerText.toUpperCase().includes('GOOGLE DRIVE'));
                }

                if (targetLink && !targetLink.hasAttribute('data-auto-clicked')) {
                    targetLink.setAttribute('data-auto-clicked', 'true');
                    targetLink.setAttribute('target', '_self');
                    console.log("Cible trouvée (" + targetLink.innerText.trim() + "). Redirection...");
                    targetLink.click();
                }
            };

            const handleDownloadPage = () => {
                const btnDownload = document.getElementById('downloadBtn');
                if (btnDownload && !btnDownload.hasAttribute('data-done')) {
                    if (btnDownload.innerText.toUpperCase().includes("DOWNLOAD NOW")) {
                        btnDownload.setAttribute('data-done', 'true');

                        // Tentative native
                        if (typeof window.clickDownload === 'function') {
                            window.clickDownload();
                        }

                        // Simulation d'événement forcée
                        const event = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
                        const span = btnDownload.querySelector('.btn-text');
                        if (span) span.dispatchEvent(event);
                        btnDownload.dispatchEvent(event);
                    }
                }
            };

            setInterval(findBestLinkAndClick, 500);
            setInterval(handleDownloadPage, 1000);
        });
    }

    // --- AUTOMATISATION OUO.IO / OUO.PRESS ---
    if (window.location.host.includes('ouo.')) {
        setInterval(() => {
            const btn = document.getElementById('btn-main') || document.getElementById('btn-submit');
            if (btn && !btn.hasAttribute('data-done')) {
                btn.setAttribute('data-done', 'true');
                setTimeout(() => btn.click(), 1200);
            }
        }, 1000);
    }

    // --- PAGES FINALES (Capture & Fermeture) ---
    const captureFinalLink = () => {
        let linkToCopy = null;

        // Cas MediaFire
        if (window.location.host.includes('mediafire.com')) {
            const mfBtn = document.querySelector('#downloadButton');
            if (mfBtn) linkToCopy = mfBtn.href;
        }
        // Cas Google Drive (On copie l'URL actuelle si c'est une page de fichier)
        else if (window.location.host.includes('drive.google.com')) {
            if (window.location.href.includes('/file/d/')) {
                linkToCopy = window.location.href;
            }
        }

        if (linkToCopy && !document.body.hasAttribute('data-copied')) {
            document.body.setAttribute('data-copied', 'true');
            GM_setClipboard(linkToCopy);
            console.log("Lien envoyé à JDownloader !");
            setTimeout(() => window.close(), 2000);
        }
    };

    if (window.location.host.includes('mediafire.com') || window.location.host.includes('drive.google.com')) {
        setInterval(captureFinalLink, 1000);
    }
})();
