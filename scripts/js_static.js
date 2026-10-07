(() => {
    'use strict';

    function freezePage() {
        console.log('[freeze] starting');

        const originalURL = document.baseURI;
        const clone = document.documentElement.cloneNode(true);

        // Remove executable / embedded content.
        clone.querySelectorAll(
            'script, iframe, frame, object, embed, audio, video'
        ).forEach(el => el.remove());

        // Remove speculative/background network hints.
        clone.querySelectorAll([
            'link[rel="preload"]',
            'link[rel="prefetch"]',
            'link[rel="modulepreload"]',
            'link[rel="preconnect"]',
            'link[rel="dns-prefetch"]'
        ].join(',')).forEach(el => el.remove());

        // Remove meta refreshes.
        clone.querySelectorAll('meta[http-equiv]').forEach(meta => {
            if (
                meta.getAttribute('http-equiv')?.toLowerCase() === 'refresh'
            ) {
                meta.remove();
            }
        });

        // Remove inline JS handlers and javascript: URLs.
        clone.querySelectorAll('*').forEach(el => {
            for (const attr of [...el.attributes]) {
                const name = attr.name.toLowerCase();
                const value = attr.value;

                if (name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                    continue;
                }

                if (
                    ['href', 'src', 'action', 'formaction'].includes(name) &&
                    /^\s*javascript:/i.test(value)
                ) {
                    el.removeAttribute(attr.name);
                }
            }
        });

        // Make relative URLs continue resolving against the original page.
        let head = clone.querySelector('head');

        if (!head) {
            head = document.createElement('head');
            clone.prepend(head);
        }

        const base = document.createElement('base');
        base.href = originalURL;
        head.prepend(base);

        // Stop CSS animations/transitions too.
        const style = document.createElement('style');
        style.textContent = `
            *,
            *::before,
            *::after {
                animation: none !important;
                transition: none !important;
            }
        `;
        head.appendChild(style);

        // Serialize the current rendered DOM.
        const html =
            '<!doctype html>\n' +
            clone.outerHTML;

        console.log(
            `[freeze] static snapshot: ${html.length} bytes`
        );

        // Build an inert replacement document.
        const blob = new Blob(
            [html],
            { type: 'text/html;charset=utf-8' }
        );

        const url = URL.createObjectURL(blob);

        console.log('[freeze] replacing live page with:', url);

        // Destroy the current live JS page.
        location.replace(url);
    }

    freezePage();
})();