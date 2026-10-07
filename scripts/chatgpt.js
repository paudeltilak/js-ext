"use strict";

(() => {


  const css = `
    :root {
      --thread-content-max-width: 100% !important;
      --main-surface-primary: #d8d8d8 !important;
      --main-surface-secondary: #e2e2e2 !important;
      --sidebar-surface-primary: #e3e3e3 !important;
      --sidebar-surface-secondary: #dddddd !important;
    }

    main,
    main [class*="max-w"],
    [data-message-author-role],
    article {
      max-width: 100% !important;
      width: 100% !important;
    }

    main {
      padding-inline: 12px !important;
      background-color: #d8d8d8 !important;
    }

    #stage-slideover-sidebar,
    #stage-sidebar-tiny-bar {
      display: none !important;
    }

    main [class*="thread-content-margin"] {
      padding-inline: 0 !important;
    }

    .prose pre {
      width: fit-content !important;
      max-width: 100% !important;
    }

    html,
    body {
      background-color: #d8d8d8 !important;
    }

    main [class*="bg-gradient"][class*="main-surface"] {
      background-image: none !important;
      background-color: #d8d8d8 !important;
    }
  `;

  const id = "bookmarklet-css";
  let style = document.getElementById(id);

  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }

  style.textContent = css;
})();




