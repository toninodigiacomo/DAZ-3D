// ==UserScript==
// @name         Render-State to JDownloader
// @version      1.6.4
// @description  Automates link retrieval, auto-clicks MediaFire, and sends links to JDownloader
// @author       Tonino Di Giacomo
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

    // 1. GLOBAL INTERCEPTION: Redirige window.open vers l'onglet actuel
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

            const rewriteAndClickLinks = () => {
                // Cible spécifiquement les boutons MediaFire
                const mfLinks = document.querySelectorAll('a.btnd.ext-link');
                mfLinks.forEach(link => {
                    if (link.innerText.includes('MEDIAFIRE')) {
                        // Force l'ouverture dans le même onglet
                        if (link.getAttribute('target') !== '_self') {
                            link.setAttribute('target', '_self');
                            link.setAttribute('rel', 'noopener noreferrer');
                        }

                        // Supprime le JS en ligne qui pourrait ouvrir de nouveaux onglets
                        link.removeAttribute('onclick');

                        // --- AJOUT : CLIC AUTOMATIQUE ---
                        // On utilise un attribut pour ne cliquer qu'une seule fois
                        if (!link.hasAttribute('data-auto-clicked')) {
                            link.setAttribute('data-auto-clicked', 'true');
                            console.log("Clic automatique sur le bouton MEDIAFIRE...");
                            link.click();
                        }
                    }
                });
            };

            // Lance le réécrivain et le cliqueur toutes les 500ms
            setInterval(rewriteAndClickLinks, 500);

            // Automatisation des étapes intermédiaires (Process & Download)
            setInterval(() => {
                const process = document.querySelector('.btn_down_text:not([data-done])');
                if (process && process.innerText.trim() === "Process link") {
                    process.setAttribute('data-done', 'true');
                    process.click();
                    if (process.parentElement) process.parentElement.click();
                }

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

    // --- PAGE FINALE MEDIAFIRE (Capture & Fermeture) ---
    if (window.location.host.includes('mediafire.com')) {
        const checkMf = setInterval(() => {
            const finalBtn = document.querySelector('#downloadButton');
            if (finalBtn && !document.body.hasAttribute('data-copied')) {
                document.body.setAttribute('data-copied', 'true');
                GM_setClipboard(finalBtn.href);
                clearInterval(checkMf);
                setTimeout(() => window.close(), 2500);
            }
        }, 1000);
    }
})();
