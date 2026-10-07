"use strict";

(() => {
  const STYLE_ID = "g-ai-wide-style";
  const ENABLED_CLASS = "g-ai-wide-on";

  function isGoogleAiMode() {
    const isGoogle =
      /^(www\.)?google\.com$/.test(location.hostname);

    const isAiMode =
      new URLSearchParams(location.search).get("udm") === "50";

    return isGoogle && isAiMode;
  }

  if (!isGoogleAiMode()) {
    alert(
      "Open Google AI Mode first: " +
      "the URL should include udm=50."
    );

    return;
  }

  const root = document.documentElement;

  if (root.classList.contains(ENABLED_CLASS)) {
    root.classList.remove(ENABLED_CLASS);
    document.getElementById(STYLE_ID)?.remove();
    return;
  }

  root.classList.add(ENABLED_CLASS);

  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");

  style.id = STYLE_ID;

  style.textContent = `
    html.g-ai-wide-on body {
      background: silver !important;
    }

    html.g-ai-wide-on .WzWwpc.vve6Ce.CZntF {
      grid-template-columns:
        32px repeat(12, minmax(0, 1fr)) 32px !important;
      column-gap: 0 !important;
      width: 100vw !important;
      max-width: none !important;
      margin-right: 0 !important;
    }

    html.g-ai-wide-on .mp0vvc.qJYHHd,
    html.g-ai-wide-on .tonYlb.Uphzyf,
    html.g-ai-wide-on .pWvJNd,
    html.g-ai-wide-on .Dn7Fzd.mZJni,
    html.g-ai-wide-on .maNQof.hh3ttd,
    html.g-ai-wide-on .UAbVe.AdSAi.iUTYAe.YBkage.sk67dc {
      width: 100% !important;
      max-width: none !important;
      box-sizing: border-box !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    html.g-ai-wide-on .mp0vvc.qJYHHd .Zkbeff {
      display: block !important;
      width: auto !important;
      max-width: none !important;
    }

    html.g-ai-wide-on .Zze5V {
      background: silver !important;
    }
  `;

  document.head.appendChild(style);
})();