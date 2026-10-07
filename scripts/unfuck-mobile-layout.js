"use strict";

(() => {
  [":root", "html", "body", "div", "main", "section", "article"].forEach(
    (selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.style.maxWidth = "100vw";
        element.style.width = "auto";
      });
    }
  );
})();