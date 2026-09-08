```javascript
/* ============================================================
   VIEWPOINT POS — FRONTEND PROTECTION
   File: js/protection.js
   ============================================================

   IMPORTANT:
   This is UI deterrence only.
   It is NOT a security boundary.

   Real security must be enforced through:
   - Supabase Authentication
   - Supabase RLS
   - Storage RLS
   - Database permissions
   - Edge Functions for secrets
   ============================================================ */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // Configuration
    // ------------------------------------------------------------

    const CONFIG = {
        disableContextMenu: true,
        disableSelection: false,
        disableImageDragging: true,
        blockDevShortcuts: false
    };

    // ------------------------------------------------------------
    // Right-click protection
    // ------------------------------------------------------------

    if (CONFIG.disableContextMenu) {
        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });
    }

    // ------------------------------------------------------------
    // Optional keyboard deterrence
    //
    // Disabled by default because browser shortcuts such as
    // Ctrl+P are useful for receipts and Ctrl+S can be legitimate.
    // ------------------------------------------------------------

    if (CONFIG.blockDevShortcuts) {
        document.addEventListener('keydown', function (event) {

            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;

            // Developer tools
            if (
                key === 'f12' ||
                (ctrl && shift && key === 'i') ||
                (ctrl && shift && key === 'j') ||
                (ctrl && shift && key === 'c')
            ) {
                event.preventDefault();
                return false;
            }

            // View source
            if (ctrl && key === 'u') {
                event.preventDefault();
                return false;
            }
        });
    }

    // ------------------------------------------------------------
    // Optional text selection protection
    // ------------------------------------------------------------

    if (CONFIG.disableSelection) {
        document.addEventListener('selectstart', function (event) {
            const target = event.target;

            // Always allow inputs and textareas
            if (
                target.matches &&
                target.matches(
                    'input, textarea, select, [contenteditable="true"]'
                )
            ) {
                return;
            }

            event.preventDefault();
        });
    }

    // ------------------------------------------------------------
    // Prevent image dragging
    // ------------------------------------------------------------

    if (CONFIG.disableImageDragging) {
        document.addEventListener('dragstart', function (event) {
            if (event.target && event.target.tagName === 'IMG') {
                event.preventDefault();
            }
        });
    }

    // ------------------------------------------------------------
    // Add minimal protection CSS
    // ------------------------------------------------------------

    const style = document.createElement('style');

    style.textContent = `
        img {
            -webkit-user-drag: none;
        }

        ${CONFIG.disableSelection ? `
        body {
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }

        input,
        textarea,
        select,
        [contenteditable="true"] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            user-select: text !important;
        }
        ` : ''}
    `;

    document.head.appendChild(style);

    // ------------------------------------------------------------
    // Protection initialized
    // ------------------------------------------------------------

    console.info('Viewpoint POS protection initialized.');

})();
```
