// ==UserScript==
// @name         hckrnews simple sort
// @namespace    hndense
// @version      2.0.0
// @description  Sort hckrnews days by time, points, or comments. Nothing else.
// @match        https://hckrnews.com/*
// @match        https://www.hckrnews.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const lists = [...document.querySelectorAll('.entries.unstyled')];
  const originalOrder = new WeakMap();

  function rows(list) {
    return [...list.querySelectorAll(':scope > .entry.row')];
  }

  function number(row, selector) {
    const text = row.querySelector(selector)?.textContent ?? '';
    return parseInt(text.replace(/,/g, '').match(/\d+/)?.[0] ?? '0', 10);
  }

  // Remember exactly how the page arrived.
  for (const list of lists) {
    rows(list).forEach((row, index) => {
      originalOrder.set(row, index);
    });
  }

  function sort(mode) {
    for (const list of lists) {
      const before = rows(list);
      const after = [...before];

      after.sort((a, b) => {
        const oa = originalOrder.get(a);
        const ob = originalOrder.get(b);

        if (mode === 'points') {
          return number(b, '.points') - number(a, '.points') || oa - ob;
        }

        if (mode === 'comments') {
          return number(b, '.comments') - number(a, '.comments') || oa - ob;
        }

        return oa - ob;
      });

      // Already sorted? Touch nothing.
      if (after.every((row, i) => row === before[i])) {
        continue;
      }

      list.append(...after);
    }
  }

  // Controls.
  const controls = document.createElement('div');
  controls.style.marginBottom = '8px';
  controls.append('sort: ');

  for (const mode of ['time', 'points', 'comments']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = mode;
    button.style.marginRight = '4px';
    button.addEventListener('click', () => sort(mode));
    controls.appendChild(button);
  }

  const entries = document.querySelector('#entries');

  if (entries) {
    entries.before(controls);
  }
})();