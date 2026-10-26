SCRIPT SHELF -- SENTENCE COLOR ONE ALWAYS ON (v0.5.0)
===================================================

NEW INSTALL
1. Unzip this archive.
2. Open chrome://extensions in Chrome.
3. Turn on Developer mode.
4. Click "Load unpacked" and select the Script-Shelf-Always-On folder.
5. Open chrome://extensions/shortcuts to confirm Option+Z / Alt+Z opens Script Shelf.
6. Reload any webpages that were already open.

UPGRADE YOUR EXISTING SCRIPT SHELF (RECOMMENDED)
1. Back up your original extension folder.
2. Copy the new manifest.json and background.js into your ORIGINAL extension
   folder, replacing those two files.
3. Copy the new scripts/sentence-color-1.js into the original scripts folder.
4. Copy the new overlay.js into the original extension folder.
5. Keep your existing catalog.js and all other scripts in their current places.
6. Open chrome://extensions and click Reload for Script Shelf.
7. Reload open webpages once to activate Sentence Color One automatically.

HOW IT WORKS
- On ordinary http:// and https:// pages, Sentence Color One loads by itself.
- Hold Option (Alt) and hover to outline a paragraph in red.
- Option+click colors alternating sentences, as in the original script.
- Option+Z continues to open the Script Shelf command palette immediately.
- Escape clears the temporary outline; it no longer permanently disables the
  automatically loaded feature.
- Links, buttons, form controls, and Script Shelf's own menu are exempt from
  the Option+click capture.
- You can still run Sentence Color One from Script Shelf to recolor an open
  two-column reader without installing duplicate event listeners.

YOUR OTHER SCRIPTS
The uploads included only Sentence Color One, not the other JS files named in
catalog.js. This ZIP includes your original catalog.js unchanged. Missing
scripts are automatically hidden from Script Shelf until you copy the other JS
files from your current extension's scripts/ directory and reload it.

LIMITATIONS
Chrome blocks extensions on some browser-internal pages, the Chrome Web Store,
and other restricted surfaces. PDF viewer content may also be unsupported.
Loading the new extension as a separate installation will not automatically
transfer your old extension's usage statistics. Updating the existing folder
avoids that problem.

To disable automatic Sentence Color globally: use Chrome's extension controls.
