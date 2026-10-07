(() => {

document.querySelectorAll('p').forEach(p => {
  p.style.whiteSpace =
    p.style.whiteSpace === 'nowrap' ? '' : 'nowrap';
});



})();