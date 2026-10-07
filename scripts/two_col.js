(() => {
  const GLOBAL_KEY = "__pagedColumnReader";
  const GAP = 12;
  // original gap 48

  //Left/Right or Page Up/Page Down · Space advances · Esc closes

  if (window[GLOBAL_KEY]) {
    window[GLOBAL_KEY].select();
    return;
  }

  let picking = false;
  let currentCandidate = null;
  let reader = null;

  // ===========================================================================
  // Element picker
  // ===========================================================================

  const pickerOverlay = document.createElement("div");

  Object.assign(pickerOverlay.style, {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "2147483647",
    border: "3px solid #4da3ff",
    background: "rgba(77, 163, 255, 0.08)",
    borderRadius: "4px",
    display: "none",
    boxSizing: "border-box",
  });

  document.documentElement.appendChild(pickerOverlay);

  const BAD_TAGS = new Set([
    "HTML",
    "BODY",
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "SVG",
    "PATH",
    "BUTTON",
    "INPUT",
    "TEXTAREA",
    "SELECT",
    "OPTION",
    "NAV",
    "FOOTER",
  ]);

  function textLength(el) {
    return (el.innerText || "").trim().length;
  }

  function paragraphCount(el) {
    return el.querySelectorAll?.("p").length || 0;
  }

  


/* older

  function scoreElement(el) {
    if (!(el instanceof HTMLElement)) return -Infinity;
    if (BAD_TAGS.has(el.tagName)) return -Infinity;

    const rect = el.getBoundingClientRect();
    const text = textLength(el);

    if (rect.width < 250) return -Infinity;
    if (rect.height < 100) return -Infinity;
    if (text < 200) return -Infinity;

    let score = 0;

    if (el.tagName === "ARTICLE") score += 1000;
    if (el.tagName === "MAIN") score += 600;
    if (el.tagName === "SECTION") score += 300;

    score += Math.min(text / 20, 300);
    score += Math.min(paragraphCount(el) * 30, 300);
    score += Math.min(rect.width / 10, 150);
    score += Math.min(rect.height / 20, 150);

    const viewportArea = window.innerWidth * window.innerHeight;
    const elementArea = rect.width * rect.height;

    if (
      rect.width > window.innerWidth * 0.95 &&
      elementArea > viewportArea * 5
    ) {
      score -= 300;
    }

    return score;
  }

  

  function findBestCandidate(start) {
    let el =
      start instanceof HTMLElement
        ? start
        : start?.parentElement;

    if (!el) return null;

    const candidates = [];

    for (
      let current = el;
      current && current !== document.body;
      current = current.parentElement
    ) {
      candidates.push(current);

      if (candidates.length >= 12) break;
    }

    let best = null;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const score = scoreElement(candidate);

      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }

    return best;
  }

  */

  


  function showPickerOverlay(el) {
    if (!el) {
      pickerOverlay.style.display = "none";
      return;
    }

    const rect = el.getBoundingClientRect();

    Object.assign(pickerOverlay.style, {
      display: "block",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }

/*
  function onPickerMouseMove(event) {
    if (!picking) return;

    const candidate = findBestCandidate(event.target);

    if (candidate !== currentCandidate) {
      currentCandidate = candidate;
      showPickerOverlay(candidate);
    }
  }
  */

  function onPickerMouseMove(event) {
  if (!picking) return;

  const candidate = event.target.closest(
    "div, article, section, main"
  );

  if (candidate !== currentCandidate) {
    currentCandidate = candidate;
    showPickerOverlay(candidate);
  }
}

  function onPickerClick(event) {
    if (!picking || !currentCandidate) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const target = currentCandidate;

    stopPicking();
    openReader(target);
  }

  function onPickerKeyDown(event) {
    if (event.key === "Escape") {
      stopPicking();
    }
  }

  function startPicking() {
    if (reader) {
      closeReader();
    }

    if (picking) return;

    picking = true;
    currentCandidate = null;

    document.addEventListener("mousemove", onPickerMouseMove, true);
    document.addEventListener("click", onPickerClick, true);
    document.addEventListener("keydown", onPickerKeyDown, true);

    document.documentElement.style.cursor = "crosshair";

    console.log(
      "Paged reader: hover over the article and click. Escape cancels."
    );
  }

  function stopPicking() {
    if (!picking) return;

    picking = false;
    currentCandidate = null;

    document.removeEventListener("mousemove", onPickerMouseMove, true);
    document.removeEventListener("click", onPickerClick, true);
    document.removeEventListener("keydown", onPickerKeyDown, true);

    document.documentElement.style.cursor = "";
    pickerOverlay.style.display = "none";
  }

  // ===========================================================================
  // Reader
  // ===========================================================================

  function cleanClone(source) {
    const clone = source.cloneNode(true);

    clone
      .querySelectorAll(
        [
          "script",
          "style",
          "link[rel='stylesheet']",
          "noscript",
          "form",
          "button",
          "input",
          "textarea",
          "select",
        ].join(",")
      )
      .forEach((el) => el.remove());

    const elements = [clone, ...clone.querySelectorAll("*")];

    for (const el of elements) {
      el.removeAttribute("id");
      el.removeAttribute("style");
      el.removeAttribute("contenteditable");

      for (const attr of [...el.attributes]) {
        if (attr.name.toLowerCase().startsWith("on")) {
          el.removeAttribute(attr.name);
        }
      }
    }

    clone.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";

      if (/^\s*javascript:/i.test(href)) {
        a.removeAttribute("href");
      } else {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });

    clone.setAttribute("data-reader-root", "");

    return clone;
  }

  function getReaderTitle(target) {
    const heading = target.querySelector(
      "h1, h2, [role='heading']"
    );

    return (
      heading?.innerText?.trim() ||
      document.title ||
      "Reader"
    );
  }

  function openReader(target) {
    closeReader();

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const host = document.createElement("div");
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          display: block;
          position: fixed;
          inset: 0;
          z-index: 2147483647;
        }

        * {
          box-sizing: border-box;
        }

        .reader {
          position: absolute;
          inset: 0;
          background: lightgray;
          color: #242424;

          font-family:
            Georgia,
            "Times New Roman",
            serif;
        }

        .toolbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 54px;

          display: flex;
          align-items: center;
          gap: 8px;

          padding: 0 20px;

          background: rgba(251, 250, 247, 0.96);
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);

          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;

          z-index: 10;

          transition:
            transform 180ms ease,
            opacity 180ms ease;
        }

        .toolbar.toolbar-hidden {
          transform: translateY(-110%);
          opacity: 0;
          pointer-events: none;
        }

        .title {
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          font-size: 14px;
          font-weight: 600;

          flex: 1;
        }

        button {
          appearance: none;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: transparent;
          color: inherit;
          border-radius: 6px;

          height: 34px;
          padding: 0 12px;

          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;

          font-size: 13px;
          cursor: pointer;
        }

        button:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.06);
        }

        button:disabled {
          opacity: 0.35;
          cursor: default;
        }

        .page-status {
          min-width: 72px;
          text-align: center;

          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;

          font-size: 13px;
          font-variant-numeric: tabular-nums;
        }

        .viewport {
          position: absolute;

          top: 6px;
          bottom: 6px;
          left: 50%;

          transform: translateX(-50%);

         /* width: min(1360px, calc(100vw - 72px)); */

          width: calc(100vw - 12px);
          /* tyo 12 px distribute 6 and 6 on each end */

          overflow: hidden;
        }

        .content {
          width: 100%;
          height: 100%;

          column-count: 2;
          column-fill: auto;
          column-gap: ${GAP}px;

          font-size: 18px;
          line-height: 1.62;

          overflow: visible;
        }

        [data-reader-root] {
          display: contents;
        }

        .content p {
          margin: 0 0 1em;
        }

        .content h1,
        .content h2,
        .content h3,
        .content h4,
        .content h5,
        .content h6 {
          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;

          line-height: 1.22;
          margin: 1.3em 0 0.55em;

          break-after: avoid;
        }

        .content h1 {
          font-size: 2em;
          margin-top: 0;
        }

        .content h2 {
          font-size: 1.45em;
        }

        .content h3 {
          font-size: 1.2em;
        }

        .content img,
        .content video,
        .content iframe,
        .content figure,
        .content table,
        .content pre,
        .content blockquote {
          max-width: 100%;
          break-inside: avoid;
        }

        .content img,
        .content video {
          height: auto;
        }

        .content figure {
          margin: 1.2em 0;
        }

        .content figcaption {
          font-size: 0.8em;
          opacity: 0.7;
          margin-top: 0.4em;
        }

        .content blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 3px solid rgba(127, 127, 127, 0.35);
        }

        .content pre {
          white-space: pre-wrap;
          overflow-wrap: anywhere;

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size: 0.78em;

          padding: 1em;

          background: rgba(127, 127, 127, 0.1);
          border-radius: 6px;
        }

        .content code {
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size: 0.86em;
        }

        .content table {
          border-collapse: collapse;
          font-size: 0.85em;
        }

        .content td,
        .content th {
          padding: 0.35em;
          border: 1px solid rgba(127, 127, 127, 0.3);
        }

        .content a {
          color: inherit;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }

        img {
  width: 10%;
  height: auto;
}



img:active {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: auto;
  height: auto;
  max-width: 90vw;
  max-height: 90vh;

  z-index: 9999;

    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.6);
}
















        @media (max-width: 760px) {
          .viewport {
            width: calc(100vw - 32px);
          }

          .content {
            column-count: 1;
          }

          .title {
            display: none;
          }
        }

        @media (prefers-color-scheme: dark) {
          .reader {
            background: #1e1e1e;
            color: #e6e2dc;
          }

          .toolbar {
            background: rgba(30, 30, 30, 0.96);
            border-bottom-color: rgba(255, 255, 255, 0.14);
          }

          button {
            border-color: rgba(255, 255, 255, 0.2);
          }

          button:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.08);
          }
        }
      </style>

      <div class="reader">
        <div class="toolbar toolbar-hidden">
          <button class="prev" title="Previous page">Previous</button>
          <button class="next" title="Next page">Next</button>

          <div class="page-status">1 / 1</div>

          <div class="title"></div>

          <button class="reselect" title="Choose another article">
            Select
          </button>

          <button class="close" title="Close reader">
            Close
          </button>
        </div>

        <div class="viewport">
          <div class="content"></div>
        </div>
      </div>
    `;

    const viewport = shadow.querySelector(".viewport");
    const content = shadow.querySelector(".content");
    const status = shadow.querySelector(".page-status");
    const title = shadow.querySelector(".title");
    const toolbar = shadow.querySelector(".toolbar");

    const prevButton = shadow.querySelector(".prev");
    const nextButton = shadow.querySelector(".next");
    const closeButton = shadow.querySelector(".close");
    const reselectButton = shadow.querySelector(".reselect");

    title.textContent = getReaderTitle(target);

    const clone = cleanClone(target);
    content.appendChild(clone);

    const state = {
      host,
      shadow,
      viewport,
      content,
      status,
      toolbar,
      prevButton,
      nextButton,

      page: 0,
      pages: 1,
      pageStep: 0,

      previousBodyOverflow,

      resizeObserver: null,
      keyHandler: null,
      mouseMoveHandler: null,
      toolbarTimer: null,
    };

    reader = state;

    // -------------------------------------------------------------------------
    // Toolbar
    // -------------------------------------------------------------------------

    function hideToolbar() {
      toolbar.classList.add("toolbar-hidden");
    }

    function scheduleToolbarHide(delay = 1800) {
      clearTimeout(state.toolbarTimer);

      state.toolbarTimer = setTimeout(() => {
        hideToolbar();
      }, delay);
    }

    function showToolbar() {
      toolbar.classList.remove("toolbar-hidden");
      scheduleToolbarHide();
    }

    function onReaderMouseMove(event) {
      // Only show it when the user deliberately moves near the top edge.
      if (event.clientY < 80) {
        showToolbar();
      }
    }

    toolbar.addEventListener("mouseenter", () => {
      clearTimeout(state.toolbarTimer);
    });

    toolbar.addEventListener("mouseleave", () => {
      scheduleToolbarHide(800);
    });

    state.mouseMoveHandler = onReaderMouseMove;

    window.addEventListener(
      "mousemove",
      state.mouseMoveHandler,
      true
    );

    // -------------------------------------------------------------------------
    // Pagination
    // -------------------------------------------------------------------------

    function updateControls() {
      status.textContent = `${state.page + 1} / ${state.pages}`;

      prevButton.disabled = state.page <= 0;
      nextButton.disabled = state.page >= state.pages - 1;
    }

    function goToPage(page, smooth = true) {
      state.page = Math.max(
        0,
        Math.min(page, state.pages - 1)
      );

      viewport.scrollTo({
        left: state.page * state.pageStep,
        behavior: smooth ? "smooth" : "auto",
      });

      updateControls();
    }

    function nextPage() {
      goToPage(state.page + 1);
    }

    function previousPage() {
      goToPage(state.page - 1);
    }

    function layout() {
      if (reader !== state) return;

      const width = viewport.clientWidth;

      if (!width) return;

      const columns = width <= 760 ? 1 : 2;

      const columnWidth =
        columns === 1
          ? width
          : (width - GAP) / 2;

      content.style.columnCount = String(columns);
      content.style.columnWidth = `${columnWidth}px`;
      content.style.columnGap = `${GAP}px`;

      state.pageStep = viewport.clientWidth + GAP;

      const wantedPage = state.page;

      viewport.scrollLeft = 0;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (reader !== state) return;

          const totalWidth = viewport.scrollWidth;

          state.pages = Math.max(
            1,
            Math.ceil(
              (totalWidth + GAP) /
              state.pageStep
            )
          );

          state.page = Math.min(
            wantedPage,
            state.pages - 1
          );

          goToPage(state.page, false);
        });
      });
    }

    prevButton.addEventListener("click", previousPage);
    nextButton.addEventListener("click", nextPage);

    closeButton.addEventListener("click", () => {
      closeReader();
    });

    reselectButton.addEventListener("click", () => {
      closeReader();
      startPicking();
    });

    state.keyHandler = (event) => {
      if (reader !== state) return;

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "PageDown":
          event.preventDefault();
          nextPage();
          break;

        case "ArrowLeft":
        case "PageUp":
          event.preventDefault();
          previousPage();
          break;

        case " ":
          event.preventDefault();

          if (event.shiftKey) {
            previousPage();
          } else {
            nextPage();
          }

          break;

        case "Home":
          event.preventDefault();
          goToPage(0);
          break;

        case "End":
          event.preventDefault();
          goToPage(state.pages - 1);
          break;

        case "Escape":
          event.preventDefault();
          closeReader();
          break;
      }
    };

    window.addEventListener(
      "keydown",
      state.keyHandler,
      true
    );

    state.resizeObserver = new ResizeObserver(() => {
      layout();
    });

    state.resizeObserver.observe(viewport);

    content.querySelectorAll("img").forEach((img) => {
      if (!img.complete) {
        img.addEventListener(
          "load",
          layout,
          { once: true }
        );
      }
    });

    layout();
  }

  function closeReader() {
    if (!reader) return;

    const state = reader;
    reader = null;

    clearTimeout(state.toolbarTimer);

    state.resizeObserver?.disconnect();

    if (state.keyHandler) {
      window.removeEventListener(
        "keydown",
        state.keyHandler,
        true
      );
    }

    if (state.mouseMoveHandler) {
      window.removeEventListener(
        "mousemove",
        state.mouseMoveHandler,
        true
      );
    }

    state.host.remove();

    document.body.style.overflow =
      state.previousBodyOverflow;
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  function destroy() {
    stopPicking();
    closeReader();

    pickerOverlay.remove();

    delete window[GLOBAL_KEY];
  }

  window[GLOBAL_KEY] = {
  select: startPicking,
  close: closeReader,
  destroy,

  getContent: () => reader?.content ?? null,
};

  startPicking();
})();