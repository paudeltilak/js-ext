(() => {
  const pick = e => {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener("click", pick, true);

    const div = e.target.closest("div");
    if (!div) return;

    div.querySelectorAll("a[href]").forEach(a => {
      if (a.nextSibling?.className === "_href") return;

      const s = document.createElement("span");
      s.className = "_href";
      s.style.cssText = "margin-left:6px;color:#888;font-size:0.9em;";
      s.textContent = `(${a.href})`;
      a.after(s);
    });
  };

  document.addEventListener("click", pick, true);
})();