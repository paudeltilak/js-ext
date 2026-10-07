javascript:(() => {
  let hoveredElement = null;
  let originalOutline = "";
  let optionPressed = false;


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
    if (!optionPressed) {
      clearHoverOutline();
      return;
    }

    const element = event.target.closest(
      "div, p, article"
    );

    if (element === hoveredElement) return;

    clearHoverOutline();

    if (!element) return;

    hoveredElement = element;
    originalOutline = element.style.outline;

    element.style.outline = "2px solid red";
  }


  // -----------------------------------------------------
  // Make selected element editable
  // -----------------------------------------------------

  function makeEditable(element) {
    if (!element) return;

    // plaintext-only prevents rich-text formatting/paste
    // in browsers that support it.
    element.setAttribute(
      "contenteditable",
      "plaintext-only"
    );

    // Disable browser spelling / writing helpers.
    element.setAttribute("spellcheck", "false");
    element.setAttribute("autocorrect", "off");
    element.setAttribute("autocapitalize", "off");
    element.setAttribute("autocomplete", "off");
    element.setAttribute(
      "writingsuggestions",
      "false"
    );

    // Discourage Grammarly and similar extensions.
    element.setAttribute("data-gramm", "false");
    element.setAttribute(
      "data-gramm_editor",
      "false"
    );
    element.setAttribute(
      "data-enable-grammarly",
      "false"
    );

    // Safari/WebKit-specific editing helpers.
    element.style.webkitUserModify =
      "read-write-plaintext-only";

    element.focus();
  }


  // -----------------------------------------------------
  // Click handling
  //
  // Normal click:
  //     Website behaves normally.
  //
  // Option / Alt + click:
  //     Make clicked div / p / article editable.
  // -----------------------------------------------------

  function handleClick(event) {
    if (!event.altKey && !optionPressed) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const targetElement = event.target.closest(
      "div, p, article"
    );

    if (!targetElement) return;

    clearHoverOutline();

    makeEditable(targetElement);
  }


  // -----------------------------------------------------
  // Option / Alt key handling
  // -----------------------------------------------------

  function handleKeyDown(event) {
    if (event.key === "Alt") {
      optionPressed = true;
      return;
    }

    if (event.key === "Escape") {
      disablePicker();
    }
  }


  function handleKeyUp(event) {
    if (event.key !== "Alt") return;

    optionPressed = false;
    clearHoverOutline();
  }


  function handleWindowBlur() {
    optionPressed = false;
    clearHoverOutline();
  }


  // -----------------------------------------------------
  // Disable picker
  // Existing editable elements stay editable.
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
  // If paged reader is open, make its content editable.
  // -----------------------------------------------------

  const readerContent =
    window.__pagedColumnReader?.getContent?.();

  if (readerContent) {
    makeEditable(readerContent);
    return;
  }


  // -----------------------------------------------------
  // Option + hover/click picker
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