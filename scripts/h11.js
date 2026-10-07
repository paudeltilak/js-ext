"use strict";

(() => {
  const style = document.createElement("style");

  style.textContent = `
    h1 {
      color: #111 !important;
    }

    h2 {
      color: #1f3a8a !important;
    }

    h3 {
      color: #64748b !important;
    }

    h4 {
      color: #94a3b8 !important;
    }

    h5 {
      color: #cbd5f5 !important;
    }

    h6 {
      color: #e2e8f0 !important;
    }
  `;

  document.head.appendChild(style);
})();