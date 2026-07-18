/* 全局交互模块：统一图片预览的像素信息与工作区偏好。 */
(function () {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const modal = $('#globalSettingsModal');
  const width = $('#globalPreviewWidth');
  const widthVal = $('#globalPreviewWidthVal');
  const showPixels = $('#globalShowPixels');
  const showGrid = $('#globalShowGrid');
  const defaults = { width: 600, pixels: true, grid: false };
  const storeKey = 'image-toolkit.workspace-settings';

  function loadSettings() { try { return { ...defaults, ...JSON.parse(localStorage.getItem(storeKey) || '{}') }; } catch (_) { return defaults; } }
  function apply(settings, persist) {
    document.documentElement.style.setProperty('--global-preview-width', settings.width + 'px');
    document.body.classList.toggle('global-hide-pixels', !settings.pixels);
    document.body.classList.toggle('global-preview-grid', settings.grid);
    width.value = settings.width; widthVal.textContent = settings.width + 'px'; showPixels.checked = settings.pixels; showGrid.checked = settings.grid;
    if (persist) localStorage.setItem(storeKey, JSON.stringify(settings));
  }
  function current() { return { width: Number(width.value), pixels: showPixels.checked, grid: showGrid.checked }; }
  function open() { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); }
  function close() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }
  $('#globalSettingsTrigger').addEventListener('click', open);
  modal.addEventListener('click', (event) => { if (event.target.closest('[data-settings-close]')) close(); });
  $('#globalSettingsDone').addEventListener('click', () => { apply(current(), true); close(); });
  $('#globalSettingsReset').addEventListener('click', () => apply(defaults, true));
  width.addEventListener('input', () => { widthVal.textContent = width.value + 'px'; apply(current(), false); });
  showPixels.addEventListener('change', () => apply(current(), false));
  showGrid.addEventListener('change', () => apply(current(), false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });

  function decoratePreview(container) {
    if (!container || container.querySelector('.pixel-boundary')) return;
    const image = container.querySelector('img');
    if (!image) return;
    const add = () => {
      if (container.querySelector('.pixel-boundary') || !image.naturalWidth) return;
      const boundary = document.createElement('div'); boundary.className = 'pixel-boundary';
      const label = document.createElement('span'); label.className = 'pixel-boundary__label';
      label.textContent = image.naturalWidth + ' × ' + image.naturalHeight + ' px';
      boundary.appendChild(label); container.appendChild(boundary);
    };
    image.complete ? add() : image.addEventListener('load', add, { once: true });
  }
  function refreshPreviews() { document.querySelectorAll('.compare, .cw-stage, .page .cell').forEach(decoratePreview); }
  new MutationObserver(refreshPreviews).observe(document.body, { childList: true, subtree: true });
  apply(loadSettings(), false); refreshPreviews();
}());
