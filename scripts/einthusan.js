(() => {
  const STYLE_ID = "etv-focus-mode";

  window.toggleEinthusanFocus = function () {
    const existing = document.getElementById(STYLE_ID);

    if (existing) {
      existing.remove();
      console.log("Einthusan focus mode: OFF");
      return false;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      html,
      body,
      #PGMovieWatcher,
      #content {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
        overflow: hidden !important;
        background: #000 !important;
      }

      body > *:not(#PGMovieWatcher) {
        display: none !important;
      }

      #PGMovieWatcher > *:not(#content) {
        display: none !important;
      }

      #content > *:not(#UIVideoPlayer) {
        display: none !important;
      }

      #UIVideoPlayer {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #000 !important;
        z-index: 2147483647 !important;
      }

      #html5-player {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
        position: relative !important;
      }

      #whiteboard,
      #video-container {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
      }

      #video-container > video:not([title="Advertisement"]) {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
        object-fit: contain !important;
      }

      #blackboard,
      #icons-and-text {
        width: 100% !important;
        height: 100% !important;
      }

      #controlbar {
        width: 100% !important;
        box-sizing: border-box !important;
      }
    `;

    document.head.appendChild(style);

    console.log("Einthusan focus mode: ON");
    return true;
  };

  // Toggle immediately when this whole snippet is pasted.
  toggleEinthusanFocus();
})();