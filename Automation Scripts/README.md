***This repository centralizes automation tools designed to optimize the workflow for DAZ 3D resource management.***
### 📂 Render-State to JDownloader (Userscript)

The Tampermonkey userscript fully automates the link retrieval chain from Render-State all the way to your JDownloader 2 instance.
#### ✨ Features
- Auto-Navigation: Automatically detects and triggers the MediaFire redirect on the initial resource page.
- Security Bypass: Simulates required interactions to pass the "Process Link" intermediate stage.
- Stealth Injection: Uses DOM injection to trigger the "Download" button, bypassing anti-bot sandboxing restrictions.
- Auto-Skip ouo.io: Automatically clicks through ouo.io and ouo.press redirect pages.
- JDownloader Integration: Captures the final direct MediaFire download link and sends it to the system clipboard.
- Auto-Cleanup: Closes the browser tab automatically once the link has been successfully captured by JDownloader.

#### 🛠 Installation
- Install the Tampermonkey extension on your browser (Firefox is highly recommended).
- Create a new script and paste the content of render_state_to_jdownloader.user.js.
- In JDownloader 2, ensure the "Clipboard Observer" (link capture icon) is enabled in the top toolbar.

#### ⚙️ Firefox Configuration (Optional)
To allow the script to close tabs automatically at the end of the process:
- Type about:config in the Firefox address bar.
- Search for dom.allow_scripts_to_close_windows.
- Set the value to true.

#### 🚀 Usage
Simply open one or multiple resource pages on Render-State. The script will handle the rest. Your links will appear automatically in your JDownloader "Linkgrabber" tab.

**Why Version 1.5.0?**
> [!IMPORTANT]
> This version utilizes a Direct Script Injection technique. By injecting code directly into the page's DOM, it bypasses the Tampermonkey "Sandbox," allowing the script to call the site's native functions (like oItem()) while maintaining high-level privileges for clipboard management and tab control.

***Developer Note for Git***
- When uploading to your repository, name the file render-state-jdownloader.user.js. This naming convention allows Tampermonkey to recognize the file and offer an "Install" button when viewing the raw file on Git.
