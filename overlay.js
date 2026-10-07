(() => {
  "use strict";

  const HOST_ID = "script-shelf-overlay-host";
  const CLOSE_HANDLER_KEY = "__scriptShelfCloseOverlay";
  const USAGE_STORAGE_KEY = "scriptShelfUsageStats";
  const RUN_SCRIPT_MESSAGE = "script-shelf:run";

  if (typeof globalThis[CLOSE_HANDLER_KEY] === "function") {
    globalThis[CLOSE_HANDLER_KEY]();
    return;
  }

  const existingHost = document.getElementById(HOST_ID);
  if (existingHost) {
    existingHost.remove();
    return;
  }

  if (!Array.isArray(globalThis.SCRIPT_CATALOG)) {
    console.error("Script Shelf catalog is unavailable.");
    return;
  }

  const scripts = globalThis.SCRIPT_CATALOG
    .map(createScriptDefinition)
    .sort((a, b) => a.label.localeCompare(b.label));

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = [
    "all: initial",
    "position: fixed",
    "inset: 0",
    "z-index: 2147483647",
    "pointer-events: none"
  ].join(";");

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.38);
        pointer-events: auto;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #202124;
      }

      .panel {
        width: min(560px, calc(100vw - 32px));
        height: min(760px, calc(100vh - 48px));
        min-height: min(360px, calc(100vh - 48px));
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.16);
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.32);
      }

      .header {
        flex: 0 0 auto;
        padding: 16px 16px 12px;
        border-bottom: 1px solid #e3e6e8;
      }

      .topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .title {
        margin: 0;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.2;
      }

      .close-button {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }

      .close-button:hover,
      .close-button:focus-visible {
        background: #f1f3f4;
        outline: none;
      }

      .search {
        width: 100%;
        height: 42px;
        padding: 0 12px;
        border: 1px solid #c7cdd1;
        border-radius: 9px;
        background: #ffffff;
        color: #202124;
        font: inherit;
        font-size: 14px;
        outline: none;
      }

      .search:focus {
        border-color: #6d7378;
        box-shadow: 0 0 0 2px rgba(109, 115, 120, 0.16);
      }

      .body {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        padding: 14px 16px 16px;
      }

      .view {
        min-height: 0;
        flex: 1 1 auto;
        display: none;
        flex-direction: column;
      }

      .view.active {
        display: flex;
      }

      .section-heading {
        flex: 0 0 auto;
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #6b7074;
      }

      .script-list {
        min-height: 0;
        display: grid;
        align-content: start;
        gap: 7px;
      }

      .quick-list {
        flex: 1 1 auto;
        overflow: hidden;
      }

      .scroll-list {
        flex: 1 1 auto;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-gutter: stable;
      }

      .script-button,
      .browse-button,
      .back-button {
        width: 100%;
        min-height: 39px;
        padding: 8px 11px;
        border: 1px solid #d5d9dc;
        border-radius: 8px;
        background: #f8f9fa;
        color: #202124;
        font: inherit;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
      }

      .script-button:hover,
      .script-button:focus-visible,
      .browse-button:hover,
      .browse-button:focus-visible,
      .back-button:hover,
      .back-button:focus-visible {
        background: #eef0f1;
        border-color: #bcc2c6;
        outline: none;
      }

      .script-button:disabled {
        opacity: 0.58;
        cursor: default;
      }

      .browse-button {
        flex: 0 0 auto;
        margin-top: 12px;
        font-weight: 600;
        text-align: center;
      }

      .back-button {
        flex: 0 0 auto;
        width: auto;
        min-height: 34px;
        margin-bottom: 10px;
        padding: 6px 10px;
      }

      .empty {
        margin: 8px 0;
        color: #6b7074;
        font-size: 13px;
        line-height: 1.45;
      }

      .status {
        flex: 0 0 auto;
        min-height: 18px;
        margin-top: 10px;
        color: #6b7074;
        font-size: 12px;
        line-height: 18px;
        overflow-wrap: anywhere;
      }

      @media (prefers-color-scheme: dark) {
        .backdrop {
          background: rgba(0, 0, 0, 0.52);
          color: #e8eaed;
        }

        .panel {
          background: #202124;
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.56);
        }

        .header {
          border-bottom-color: #3c4043;
        }

        .close-button:hover,
        .close-button:focus-visible,
        .script-button:hover,
        .script-button:focus-visible,
        .browse-button:hover,
        .browse-button:focus-visible,
        .back-button:hover,
        .back-button:focus-visible {
          background: #303134;
        }

        .search {
          background: #292a2d;
          color: #e8eaed;
          border-color: #5f6368;
        }

        .search:focus {
          border-color: #9aa0a6;
          box-shadow: 0 0 0 2px rgba(154, 160, 166, 0.18);
        }

        .section-heading,
        .empty,
        .status {
          color: #9aa0a6;
        }

        .script-button,
        .browse-button,
        .back-button {
          background: #292a2d;
          color: #e8eaed;
          border-color: #4f5356;
        }
      }
    </style>

    <div class="backdrop" id="backdrop">
      <section class="panel" id="panel" role="dialog" aria-modal="true" aria-labelledby="title">
        <header class="header">
          <div class="topline">
            <h1 class="title" id="title">Script Shelf</h1>
            <button class="close-button" id="close" type="button" aria-label="Close">&times;</button>
          </div>
          <input
            class="search"
            id="search"
            type="search"
            placeholder="Find any script..."
            autocomplete="off"
            aria-label="Find a script"
          >
        </header>

        <div class="body">
          <div class="view active" id="default-view">
            <div class="section-heading">Quick Access</div>
            <div class="script-list quick-list" id="quick-list"></div>
            <div class="empty" id="quick-empty" hidden>
              Quick Access will populate as you run scripts.
            </div>
            <button class="browse-button" id="browse" type="button">More scripts</button>
          </div>

          <div class="view" id="browse-view">
            <button class="back-button" id="back" type="button">Back to Quick Access</button>
            <div class="section-heading">All scripts</div>
            <div class="script-list scroll-list" id="all-list"></div>
          </div>

          <div class="view" id="search-view">
            <div class="section-heading">Search results</div>
            <div class="script-list scroll-list" id="search-list"></div>
            <div class="empty" id="search-empty" hidden>No matching scripts.</div>
          </div>

          <div class="status" id="status" aria-live="polite"></div>
        </div>
      </section>
    </div>
  `;

  document.documentElement.append(host);
  globalThis[CLOSE_HANDLER_KEY] = closeOverlay;

  const backdrop = shadow.getElementById("backdrop");
  const panel = shadow.getElementById("panel");
  const closeButton = shadow.getElementById("close");
  const searchInput = shadow.getElementById("search");
  const defaultView = shadow.getElementById("default-view");
  const browseView = shadow.getElementById("browse-view");
  const searchView = shadow.getElementById("search-view");
  const quickList = shadow.getElementById("quick-list");
  const quickEmpty = shadow.getElementById("quick-empty");
  const browseButton = shadow.getElementById("browse");
  const backButton = shadow.getElementById("back");
  const allList = shadow.getElementById("all-list");
  const searchList = shadow.getElementById("search-list");
  const searchEmpty = shadow.getElementById("search-empty");
  const status = shadow.getElementById("status");

  let currentView = "default";

  closeButton.addEventListener("click", closeOverlay);

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closeOverlay();
    }
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  browseButton.addEventListener("click", () => {
    searchInput.value = "";
    showView("browse");
    backButton.focus();
  });

  backButton.addEventListener("click", () => {
    showView("default");
    searchInput.focus();
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      showView("default");
      return;
    }

    const matches = scripts.filter((script) =>
      script.label.toLowerCase().includes(query) ||
      script.filename.toLowerCase().includes(query)
    );

    renderButtonList(searchList, matches);
    searchEmpty.hidden = matches.length !== 0;
    showView("search");
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && currentView === "search") {
      const firstButton = searchList.querySelector("button");
      if (firstButton) {
        event.preventDefault();
        firstButton.click();
      }
    }
  });

  shadow.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();

    if (searchInput.value) {
      searchInput.value = "";
      showView("default");
      searchInput.focus();
      return;
    }

    if (currentView === "browse") {
      showView("default");
      searchInput.focus();
      return;
    }

    closeOverlay();
  });

  window.addEventListener("resize", handleResize, { passive: true });

  renderButtonList(allList, scripts);
  initializeQuickAccess();
  searchInput.focus();

  async function initializeQuickAccess() {
    const candidates = await getQuickAccessCandidates();

    quickEmpty.hidden = candidates.length !== 0;
    renderButtonList(quickList, candidates);

    requestAnimationFrame(() => {
      trimQuickAccessToFit();
    });
  }

  function handleResize() {
    if (currentView !== "default") {
      return;
    }

    initializeQuickAccess();
  }

  function showView(viewName) {
    currentView = viewName;
    defaultView.classList.toggle("active", viewName === "default");
    browseView.classList.toggle("active", viewName === "browse");
    searchView.classList.toggle("active", viewName === "search");
    status.textContent = "";
  }

  function closeOverlay() {
    window.removeEventListener("resize", handleResize);
    if (globalThis[CLOSE_HANDLER_KEY] === closeOverlay) {
      delete globalThis[CLOSE_HANDLER_KEY];
    }
    host.remove();
  }

  function createScriptDefinition(filename) {
    if (typeof filename !== "string" || !filename.endsWith(".js")) {
      throw new TypeError(`Invalid script filename: ${String(filename)}`);
    }

    return {
      filename,
      label: filenameToLabel(filename)
    };
  }

  function filenameToLabel(filename) {
    return filename
      .replace(/\.js$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function renderButtonList(container, scriptList) {
    container.replaceChildren();

    for (const script of scriptList) {
      container.append(createScriptButton(script));
    }
  }

  function createScriptButton(script) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "script-button";
    button.textContent = script.label;
    button.title = script.filename;
    button.dataset.filename = script.filename;

    button.addEventListener("click", () => runScript(script, button));

    return button;
  }

  async function getQuickAccessCandidates() {
    let stored;

    try {
      stored = await chrome.storage.local.get(USAGE_STORAGE_KEY);
    } catch (error) {
      console.warn("Could not read Script Shelf usage stats:", error);
      return [];
    }

    const stats = normalizeStats(stored[USAGE_STORAGE_KEY]);

    const usedScripts = scripts
      .map((script) => {
        const usage = stats[script.filename];

        return {
          script,
          count:
            usage && Number.isFinite(usage.count)
              ? usage.count
              : 0,
          lastUsed:
            usage && Number.isFinite(usage.lastUsed)
              ? usage.lastUsed
              : 0
        };
      })
      .filter((item) => item.count > 0 && item.lastUsed > 0);

    const byRecent = [...usedScripts].sort(
      (a, b) => b.lastUsed - a.lastUsed
    );

    const byMostUsed = [...usedScripts].sort(
      (a, b) =>
        b.count - a.count ||
        b.lastUsed - a.lastUsed ||
        a.script.label.localeCompare(b.script.label)
    );

    const ordered = [];
    const seen = new Set();
    const maxLength = Math.max(byRecent.length, byMostUsed.length);

    for (let index = 0; index < maxLength; index += 1) {
      addCandidate(ordered, seen, byRecent[index]);
      addCandidate(ordered, seen, byMostUsed[index]);
    }

    return ordered.map((item) => item.script);
  }

  function normalizeStats(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return value;
  }

  function addCandidate(target, seen, candidate) {
    if (!candidate || seen.has(candidate.script.filename)) {
      return;
    }

    target.push(candidate);
    seen.add(candidate.script.filename);
  }

  function trimQuickAccessToFit() {
    if (quickEmpty.hidden === false) {
      return;
    }

    while (
      quickList.lastElementChild &&
      quickList.scrollHeight > quickList.clientHeight + 1
    ) {
      quickList.lastElementChild.remove();
    }
  }

  async function runScript(script, button) {
    button.disabled = true;
    status.textContent = `Running ${script.label}...`;

    try {
      const response = await chrome.runtime.sendMessage({
        type: RUN_SCRIPT_MESSAGE,
        filename: script.filename
      });

      if (!response?.ok) {
        throw new Error(response?.error || "The script could not be run.");
      }

      closeOverlay();
    } catch (error) {
      console.error("Script Shelf error:", { script, error });
      status.textContent =
        error instanceof Error ? error.message : String(error);
      button.disabled = false;
    }
  }
})();
