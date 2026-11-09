(() => {
  const url = new URL(window.location.href);
  url.searchParams.set("sort", "review-count-rank");
  window.location.assign(url.href);
})();