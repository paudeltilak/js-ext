// ==UserScript==
// @name         DOM Pruner
// @namespace    local.dom-pruner
// @version      1.0
// @description  Alt-hover inspect, Alt-wheel walk DOM, Alt-click hide.
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==


/*
It uses Alt+hover to inspect, 
Alt+wheel to move up/down the ancestor chain, 
Alt+click to hide the outlined node, 
Alt+Z to undo, and 
Alt+Shift+Z to restore everything.
*/

(() => {
  'use strict';

  // Prevent duplicate installation if you paste/reload the script.
  if (window.__domPruner) {
    window.__domPruner.destroy();
  }

  const state = {
    altDown: false,

    // Element physically under the mouse.
    origin: null,

    // Element currently selected/highlighted.
    selected: null,

    // 0 = origin, 1 = parent, 2 = grandparent...
    depth: 0,

    // Undo stack.
    hidden: [],
  };

  // ---------------------------------------------------------------------------
  // Overlay
  // ---------------------------------------------------------------------------

  const overlay = document.createElement('div');

  Object.assign(overlay.style, {
    position: 'fixed',
    display: 'none',
    pointerEvents: 'none',
    zIndex: '2147483647',

    border: '2px solid #ff2d2d',
    background: 'rgba(255, 45, 45, 0.08)',

    boxSizing: 'border-box',
  });

  const label = document.createElement('div');

  Object.assign(label.style, {
    position: 'absolute',
    left: '-2px',
    top: '-24px',

    maxWidth: '500px',
    height: '22px',
    padding: '2px 6px',

    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',

    background: '#ff2d2d',
    color: '#fff',

    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '18px',

    boxSizing: 'border-box',
  });

  overlay.appendChild(label);
  document.documentElement.appendChild(overlay);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function isProtected(el) {
    return (
      !el ||
      el === document.documentElement ||
      el === document.body ||
      el === overlay ||
      overlay.contains(el)
    );
  }

  function describeElement(el) {
    if (!el) return '';

    let s = el.tagName.toLowerCase();

    if (el.id) {
      s += `#${el.id}`;
    }

    if (el.classList?.length) {
      s +=
        '.' +
        [...el.classList]
          .slice(0, 4)
          .join('.');
    }

    return s;
  }

  function getAncestor(origin, depth) {
    let el = origin;

    for (let i = 0; i < depth && el; i++) {
      el = el.parentElement;
    }

    return el;
  }

  function maxDepth(origin) {
    let depth = 0;
    let el = origin;

    while (
      el?.parentElement &&
      el.parentElement !== document.body &&
      el.parentElement !== document.documentElement
    ) {
      depth++;
      el = el.parentElement;
    }

    return depth;
  }

  function updateSelection() {
    if (!state.altDown || !state.origin) {
      hideOverlay();
      return;
    }

    state.selected = getAncestor(state.origin, state.depth);

    if (isProtected(state.selected)) {
      hideOverlay();
      return;
    }

    drawOverlay(state.selected);
  }

  function drawOverlay(el) {
    const r = el.getBoundingClientRect();

    // Completely invisible / detached / zero-size elements aren't useful.
    if (!r.width && !r.height) {
      hideOverlay();
      return;
    }

    Object.assign(overlay.style, {
      display: 'block',
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });

    label.textContent =
      `${describeElement(el)}  ` +
      `[depth ${state.depth}]  ` +
      `${Math.round(r.width)}×${Math.round(r.height)}`;

    // If we're too close to the top, put the label inside instead.
    label.style.top = r.top < 26 ? '-2px' : '-24px';
  }

  function hideOverlay() {
    overlay.style.display = 'none';
    state.selected = null;
  }

  // ---------------------------------------------------------------------------
  // Hide / undo
  // ---------------------------------------------------------------------------

  function hideSelected() {
    const el = state.selected;

    if (isProtected(el)) return;

    state.hidden.push({
      el,
      display: el.style.getPropertyValue('display'),
      priority: el.style.getPropertyPriority('display'),
    });

    // !important beats a lot of obnoxious site CSS.
    el.style.setProperty('display', 'none', 'important');

    state.origin = null;
    state.selected = null;
    state.depth = 0;

    hideOverlay();
  }

  function undo() {
    const item = state.hidden.pop();
    if (!item) return;

    if (item.display) {
      item.el.style.setProperty(
        'display',
        item.display,
        item.priority
      );
    } else {
      item.el.style.removeProperty('display');
    }
  }

  function restoreAll() {
    while (state.hidden.length) {
      undo();
    }
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  function onMouseMove(e) {
    if (!state.altDown) return;

    // If the physical element under the cursor changes, start over from depth 0.
    if (e.target !== state.origin) {
      state.origin = e.target;
      state.depth = 0;
    }

    updateSelection();
  }

  function onWheel(e) {
    if (!e.altKey || !state.origin) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY < 0) {
      // Wheel up -> parent.
      state.depth = Math.min(
        state.depth + 1,
        maxDepth(state.origin)
      );
    } else if (e.deltaY > 0) {
      // Wheel down -> back toward original element.
      state.depth = Math.max(0, state.depth - 1);
    }

    updateSelection();
  }

  function onClick(e) {
    if (!e.altKey || !state.selected) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    hideSelected();
  }

  function onKeyDown(e) {
    if (e.key === 'Alt') {
      state.altDown = true;
      return;
    }

    if (e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        restoreAll();
      } else {
        undo();
      }

      return;
    }

    if (e.key === 'Escape') {
      state.origin = null;
      state.selected = null;
      state.depth = 0;
      hideOverlay();
    }
  }

  function onKeyUp(e) {
    if (e.key === 'Alt') {
      state.altDown = false;
      state.origin = null;
      state.selected = null;
      state.depth = 0;

      hideOverlay();
    }
  }

  // Page scrolling / animations can move the selected element without a
  // mousemove event, so keep the overlay attached to it.
  function onViewportChange() {
    if (state.altDown && state.selected) {
      drawOverlay(state.selected);
    }
  }

  // Capture phase deliberately beats most application event handlers.
  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('wheel', onWheel, {
    capture: true,
    passive: false,
  });
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('keyup', onKeyUp, true);

  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('resize', onViewportChange, true);

  // ---------------------------------------------------------------------------
  // Cleanup / console API
  // ---------------------------------------------------------------------------

  function destroy() {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('wheel', onWheel, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('keyup', onKeyUp, true);

    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('resize', onViewportChange, true);

    overlay.remove();

    delete window.__domPruner;
  }

  window.__domPruner = {
    undo,
    restoreAll,
    destroy,
    get selected() {
      return state.selected;
    },
    get hiddenCount() {
      return state.hidden.length;
    },
  };

  console.log(`
DOM Pruner active

Alt + hover       inspect
Alt + wheel up    select parent
Alt + wheel down  select child/original direction
Alt + click       hide selected subtree
Alt + Z           undo
Alt + Shift + Z   restore all
Esc               cancel selection

Console:
  __domPruner.undo()
  __domPruner.restoreAll()
  __domPruner.destroy()
`);
})();