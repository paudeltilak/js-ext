"use strict";

(() => {
  const STYLE_ID = "gemini-wide-zen-style";
  const ENABLED_CLASS = "gemini-wide-zen-on";

/*
* this is v2
* can use diff viewer to see diff, but basically it's color stuff only
*/



  /*
   * Adjust these two values to taste.
   *
   * PROSE_MAX:
   *   "112ch" = comfortable reading width
   *   "none"  = literal full-width prose
   */
  const PAGE_GUTTER = "clamp(14px, 2vw, 34px)";
  const PROSE_MAX = "none";

  function isGemini() {
    return location.hostname === "gemini.google.com";
  }

  if (!isGemini()) {
    alert("Open gemini.google.com first.");
    return;
  }

  const root = document.documentElement;

  /*
   * Running the script again disables it.
   */
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
    html.${ENABLED_CLASS} {
      --gemini-zen-gutter: ${PAGE_GUTTER};
      --gemini-zen-prose-max: ${PROSE_MAX};
 
    }

    /*
     * Prevent page-level horizontal scrolling while allowing
     * individual code blocks to scroll normally.
     */
    html.${ENABLED_CLASS},
    html.${ENABLED_CLASS} body {
      overflow-x: clip !important;
    }

    /*
     * Remove width restrictions from Gemini's primary layout.
     */
    html.${ENABLED_CLASS} :is(
      main,
      chat-window,
      .chat-window,
      .main-content,
      infinite-scroller
    ) {
      max-width: none !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }

    html.${ENABLED_CLASS} :is(
      chat-window,
      .chat-window,
      infinite-scroller
    ) {
      width: 100% !important;
      scrollbar-gutter: stable !important;
    }

    /*
     * Full-width conversation and prompt areas with a small,
     * responsive edge gutter.
     */
    html.${ENABLED_CLASS} :is(
      .conversation-container,
      conversation-container,
      .input-area-container
    ) {
      width: calc(
        100% -
        var(--gemini-zen-gutter) -
        var(--gemini-zen-gutter)
      ) !important;

      max-width: none !important;
      min-width: 0 !important;

      margin-left: auto !important;
      margin-right: auto !important;

      box-sizing: border-box !important;
    }

    /*
     * Remove nested width limits without changing Gemini's
     * native colors, typography, controls, or message styling.
     */
    html.${ENABLED_CLASS} :is(
      user-query,
      model-response,
      response-container,
      .response-container,
      .user-query-container,
      .model-response-text,
      .p-f-p-message-content,
      .markdown-main-panel
    ) {
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }

    /*
     * Reader-friendly prose.
     *
     * The conversation occupies the full page, but long prose
     * lines remain comfortable to scan.
     */
    html.${ENABLED_CLASS}
      model-response
      .markdown-main-panel
      > :is(
        p,
        ul,
        ol,
        blockquote,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6
      ) {
      width: 100% !important;
      max-width: var(--gemini-zen-prose-max) !important;
      margin-left: auto !important;
      margin-right: auto !important;
      line-height: 1.55 !important;
      text-wrap: pretty;
    }

    /*
     * Wide material should use the space rather than inherit
     * the prose-width restriction.
     */
    html.${ENABLED_CLASS} model-response :is(
      pre,
      table,
      .code-block,
      .code-block-declaration
    ) {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    html.${ENABLED_CLASS} model-response pre {
      overflow-x: auto !important;
    }

    html.${ENABLED_CLASS} model-response table {
      width: 100% !important;
    }

    /*
     * Keep the modification unobtrusive on small screens.
     */
    @media (max-width: 700px) {
      html.${ENABLED_CLASS} {
        --gemini-zen-gutter: 8px;
        --gemini-zen-prose-max: none;
      }
    }












/*
 * Gemini Zen canvas — current DOM version.
 */
html.${ENABLED_CLASS} {
  --gemini-zen-canvas: silver;
  --gemini-zen-surface: #ebe9ea;
  --gemini-zen-input: #fafafa;
  --gemini-zen-border: rgb(0 0 0 / 7%);
}

/*
 * Application canvas and main content.
 */
html.${ENABLED_CLASS},
html.${ENABLED_CLASS} body,
html.${ENABLED_CLASS} mat-sidenav-container,
html.${ENABLED_CLASS} .mat-drawer-container,
html.${ENABLED_CLASS} bard-sidenav-content,
html.${ENABLED_CLASS} mat-sidenav-content,
html.${ENABLED_CLASS} .mat-drawer-content,
html.${ENABLED_CLASS} .mat-sidenav-content,
html.${ENABLED_CLASS} chat-window,
html.${ENABLED_CLASS} chat-window-content,
html.${ENABLED_CLASS} infinite-scroller,
html.${ENABLED_CLASS} .chat-window,
html.${ENABLED_CLASS} .chat-container,
html.${ENABLED_CLASS} .content-container,
html.${ENABLED_CLASS} .conversation-container {
  background-color: var(--gemini-zen-canvas) !important;
  background-image: none !important;
}

/*
 * Actual current sidebar elements.
 */
html.${ENABLED_CLASS} bard-sidenav,
html.${ENABLED_CLASS} side-navigation-content,
html.${ENABLED_CLASS} side-navigation-v2,
html.${ENABLED_CLASS} mat-sidenav,
html.${ENABLED_CLASS} .mat-drawer,
html.${ENABLED_CLASS} .mat-sidenav,
html.${ENABLED_CLASS} [class*="mat-drawer"],
html.${ENABLED_CLASS} [class*="mat-sidenav"] {
  background-color: var(--gemini-zen-canvas) !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

/*
 * Remove the sidebar's fade overlays.
 *
 * Do not target every pseudo-element—Gemini uses pseudo-elements
 * for some icons.
 */
html.${ENABLED_CLASS} bard-sidenav::before,
html.${ENABLED_CLASS} bard-sidenav::after,
html.${ENABLED_CLASS} side-navigation-content::before,
html.${ENABLED_CLASS} side-navigation-content::after,
html.${ENABLED_CLASS} side-navigation-v2::before,
html.${ENABLED_CLASS} side-navigation-v2::after,
html.${ENABLED_CLASS} .conversation-items-container::before,
html.${ENABLED_CLASS} .conversation-items-container::after,
html.${ENABLED_CLASS} .nav-content::before,
html.${ENABLED_CLASS} .nav-content::after {
  background: none !important;
  opacity: 0 !important;
}

/*
 * Current bottom-area wrappers.
 */
html.${ENABLED_CLASS} input-container,
html.${ENABLED_CLASS} .bottom-container,
html.${ENABLED_CLASS} .bottom-section-container,
html.${ENABLED_CLASS} .input-area-container-v2,
html.${ENABLED_CLASS} hallucination-disclaimer,
html.${ENABLED_CLASS} location-footer {
  background-color: var(--gemini-zen-canvas) !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/*
 * Kill the large white/gradient transition above the input.
 */
html.${ENABLED_CLASS} .top-gradient-container,
html.${ENABLED_CLASS} .top-gradient,
html.${ENABLED_CLASS} .bottom-gradient-container,
html.${ENABLED_CLASS} .bottom-gradient,
html.${ENABLED_CLASS} .autosuggest-scrim,
html.${ENABLED_CLASS} .blur-bg {
  background: transparent !important;
  background-image: none !important;
  opacity: 0 !important;
}

html.${ENABLED_CLASS} input-container.input-gradient::before,
html.${ENABLED_CLASS} input-container.input-gradient::after,
html.${ENABLED_CLASS} .input-gradient::before,
html.${ENABLED_CLASS} .input-gradient::after {
  background: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

/*
 * Keep only the actual prompt field light.
 */
html.${ENABLED_CLASS} input-area-v2 {
  background-color: var(--gemini-zen-input) !important;
  background-image: none !important;

  border: 1px solid var(--gemini-zen-border) !important;
  border-radius: 32px !important;

  box-shadow:
    0 1px 2px rgb(0 0 0 / 4%),
    0 5px 16px rgb(0 0 0 / 7%) !important;
}

/*
 * Let the input-area-v2 surface provide the white background.
 */
html.${ENABLED_CLASS} input-area-v2 :where(
  fieldset,
  .input-area-container,
  .text-input-field,
  .textarea-wrapper,
  .text-input-field_textarea-wrapper,
  .mat-mdc-text-field-wrapper,
  .mdc-text-field,
  .mdc-text-field--filled,
  .mdc-text-field--no-label,
  rich-textarea,
  .ql-editor
) {
  background-color: transparent !important;
  background-image: none !important;
}

/*
 * Suggestions: lighter than the canvas, but not stark white.
 */
html.${ENABLED_CLASS} :where(
  .cards-container,
  .suggestion-card,
  .related-question-card,
  suggestion-chip
) {
  background-color: transparent !important;
}

html.${ENABLED_CLASS} :where(
  .suggestion,
  .suggestion-container,
  .card
) {
  border-color: var(--gemini-zen-border) !important;
  box-shadow: none !important;
}



/* mero */

.capabilities-disclaimer p[data-test-id="disclaimer"] {
  visibility: hidden !important;
  height: 12px !important;
  line-height: 12px !important;
  margin: 0 !important;
  padding: 0 !important;
}


g1-dynamic-upsell-button {
  display: none !important;
}


.conversation-container {
    width: 100% !important;
    max-width: none !important;
    margin-inline: 0 !important;
    padding-inline: 0 !important;
}

main,
.chat-history {
    padding-inline: 0 !important;
}







  `;

  (document.head || document.documentElement).appendChild(style);
})();