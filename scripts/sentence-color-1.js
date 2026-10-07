javascript:(() => {
  let hoveredElement = null;
  let originalOutline = "";
  let optionPressed = false;

  const sentenceColors = [
    "rgba(160, 220, 255, 0.35)",
    "rgba(255, 240, 120, 0.45)"
  ];

  const sentenceSegmenter = new Intl.Segmenter("en", {
    granularity: "sentence"
  });


  // -----------------------------------------------------
  // Hover outline
  // -----------------------------------------------------

  function clearHoverOutline() {
    if (!hoveredElement) return;

    hoveredElement.style.outline = originalOutline;

    hoveredElement = null;
    originalOutline = "";
  }


  function handleMouseOver(event) {
    // Do nothing unless Option / Alt is being held.
    if (!optionPressed) {
      clearHoverOutline();
      return;
    }

    const element = event.target.closest("div, p, article");

    if (element === hoveredElement) return;

    clearHoverOutline();

    if (!element) return;

    hoveredElement = element;
    originalOutline = element.style.outline;

    element.style.outline = "2px solid red";
  }


  // -----------------------------------------------------
  // Sentence highlighting
  // -----------------------------------------------------

  function removeExistingSentenceHighlights(paragraph) {
    const existingHighlights = [
      ...paragraph.querySelectorAll(
        'span[data-sentence-highlight="true"]'
      )
    ];

    existingHighlights.reverse().forEach((highlight) => {
      highlight.replaceWith(...highlight.childNodes);
    });

    paragraph.normalize();
  }


  function collectTextNodes(paragraph) {
    const textNodes = [];

    const walker = document.createTreeWalker(
      paragraph,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(textNode) {
          if (!textNode.nodeValue) {
            return NodeFilter.FILTER_REJECT;
          }

          const parent = textNode.parentElement;

          if (
            !parent ||
            parent.closest(
              "script, style, noscript, textarea"
            )
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    return textNodes;
  }


  function highlightParagraph(paragraph) {
    removeExistingSentenceHighlights(paragraph);

    const textNodes = collectTextNodes(paragraph);

    if (!textNodes.length) return;

    let characterOffset = 0;

    const textNodeLocations = textNodes.map((textNode) => {
      const start = characterOffset;
      const end = start + textNode.nodeValue.length;

      characterOffset = end;

      return {
        textNode,
        start,
        end
      };
    });

    const completeText = textNodes
      .map((textNode) => textNode.nodeValue)
      .join("");

    const sentences = [
      ...sentenceSegmenter.segment(completeText)
    ].map((sentence, sentenceIndex) => ({
      start: sentence.index,
      end: sentence.index + sentence.segment.length,
      sentenceIndex
    }));


    for (const location of textNodeLocations) {
      const {
        textNode,
        start: nodeStart,
        end: nodeEnd
      } = location;

      const originalText = textNode.nodeValue;

      const sentencesInsideNode = sentences.filter(
        (sentence) =>
          sentence.end > nodeStart &&
          sentence.start < nodeEnd
      );

      if (!sentencesInsideNode.length) continue;

      const replacement =
        document.createDocumentFragment();

      let localPosition = 0;


      for (const sentence of sentencesInsideNode) {
        const localStart =
          Math.max(sentence.start, nodeStart) -
          nodeStart;

        const localEnd =
          Math.min(sentence.end, nodeEnd) -
          nodeStart;


        if (localStart > localPosition) {
          replacement.append(
            document.createTextNode(
              originalText.slice(
                localPosition,
                localStart
              )
            )
          );
        }


        if (localEnd > localStart) {
          const highlight =
            document.createElement("span");

          highlight.dataset.sentenceHighlight =
            "true";

          highlight.style.backgroundColor =
            sentenceColors[
              sentence.sentenceIndex %
                sentenceColors.length
            ];

          highlight.textContent =
            originalText.slice(
              localStart,
              localEnd
            );

          replacement.append(highlight);
        }

        localPosition = localEnd;
      }


      if (localPosition < originalText.length) {
        replacement.append(
          document.createTextNode(
            originalText.slice(localPosition)
          )
        );
      }

      textNode.replaceWith(replacement);
    }
  }


  // -----------------------------------------------------
  // Click handling
  //
  // Normal click:
  //     Website behaves normally.
  //
  // Option / Alt + click:
  //     Capture the click and highlight the paragraph.
  // -----------------------------------------------------

  function handleClick(event) {
    // If Option / Alt isn't held, leave the website alone.
    if (!event.altKey && !optionPressed) {
      return;
    }

    // Option / Alt is held, so this click belongs to us.
    event.preventDefault();
    event.stopPropagation();

    const targetElement = event.target.closest(
      "div, p, article"
    );

    if (!targetElement) return;

    clearHoverOutline();

    const paragraphs =
      targetElement.tagName === "P"
        ? [targetElement]
        : [
            ...targetElement.querySelectorAll("p")
          ];

    paragraphs.forEach(highlightParagraph);
  }


  // -----------------------------------------------------
  // Option / Alt key handling
  // -----------------------------------------------------

  function handleKeyDown(event) {
    // On macOS the Option key is reported as "Alt".
    if (event.key === "Alt") {
      optionPressed = true;
      return;
    }


    // Escape completely disables the picker.
    if (event.key === "Escape") {
      disablePicker();
    }
  }


  function handleKeyUp(event) {
    if (event.key !== "Alt") return;

    optionPressed = false;

    // Remove the red outline as soon as Option is released.
    clearHoverOutline();
  }


  // If the browser loses focus while Option is held,
  // make sure we don't accidentally remain in Option mode.
  function handleWindowBlur() {
    optionPressed = false;
    clearHoverOutline();
  }


  // -----------------------------------------------------
  // Disable picker
  // -----------------------------------------------------

  function disablePicker() {
    optionPressed = false;

    clearHoverOutline();

    document.removeEventListener(
      "mouseover",
      handleMouseOver,
      true
    );

    document.removeEventListener(
      "click",
      handleClick,
      true
    );

    document.removeEventListener(
      "keydown",
      handleKeyDown,
      true
    );

    document.removeEventListener(
      "keyup",
      handleKeyUp,
      true
    );

    window.removeEventListener(
      "blur",
      handleWindowBlur,
      true
    );
  }


  // -----------------------------------------------------
  // If our paged reader (two col.js) is open,
  // highlight it immediately.
  // -----------------------------------------------------

  const readerContent =
    window.__pagedColumnReader?.getContent?.();

  if (readerContent) {
    readerContent
      .querySelectorAll("p")
      .forEach(highlightParagraph);

    return;
  }


  // -----------------------------------------------------
  // Otherwise, use the Option + hover/click picker.
  // -----------------------------------------------------

  document.addEventListener(
    "mouseover",
    handleMouseOver,
    true
  );

  document.addEventListener(
    "click",
    handleClick,
    true
  );

  document.addEventListener(
    "keydown",
    handleKeyDown,
    true
  );

  document.addEventListener(
    "keyup",
    handleKeyUp,
    true
  );

  window.addEventListener(
    "blur",
    handleWindowBlur,
    true
  );
})();