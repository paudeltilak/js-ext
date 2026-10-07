(() => {
  const ID = 'forced-cinema-mode';
  const existing = document.getElementById(ID);
  const player = document.getElementById('UIVideoPlayer');

  // TOGGLE OFF
  if (existing) {
    existing.remove();

    if (player) {
      player.style.position = player.dataset.cinemaOldPosition || '';
      player.style.zIndex = player.dataset.cinemaOldZIndex || '';

      delete player.dataset.cinemaOldPosition;
      delete player.dataset.cinemaOldZIndex;
    }

    console.log('Cinema mode: OFF');
    return;
  }

  // TOGGLE ON
  const overlay = document.createElement('div');
  overlay.id = ID;

  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: '#000',
    zIndex: '9998'
  });

  document.body.appendChild(overlay);

  if (player) {
    // Save original styles so they can be restored
    player.dataset.cinemaOldPosition = player.style.position;
    player.dataset.cinemaOldZIndex = player.style.zIndex;

    player.style.position = 'relative';
    player.style.zIndex = '9999';
  }

  console.log('Cinema mode: ON');
})();