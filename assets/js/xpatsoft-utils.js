/* XPATSOFT shared safe helpers — used by tool modules for untrusted values. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.XPATSOFT_Utils = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var WIN_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  var CTRL = /[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
  var UNSAFE = /[<>:"/\\|?*]/g;
  /**
   * Turn an arbitrary (possibly hostile) filename into a safe download name.
   * Never returns an empty string and never returns a path.
   */
  function safeFilename(name, fallback, maxLen) {
    var fb = fallback || 'download';
    var limit = maxLen || 120;
    if (name == null) { return fb; }
    var s = String(name);
    s = s.replace(CTRL, '');
    s = s.split(/[\\/]/).pop() || '';      // strip any path first, keep basename
    s = s.replace(UNSAFE, '_');
    s = s.replace(/^[.\s-]+/, '');          // no leading dots/space/dash
    s = s.replace(/\s+/g, ' ').trim();
    if (!s) { return fb; }
    var dot = s.lastIndexOf('.');
    var stem = dot > 0 ? s.slice(0, dot) : s;
    var ext = dot > 0 ? s.slice(dot) : '';
    if (WIN_RESERVED.test(stem)) { stem = '_' + stem; }
    if (ext.length > 12) { ext = ext.slice(0, 12); }
    var room = limit - ext.length;
    if (room < 1) { return fb; }
    if (stem.length > room) { stem = stem.slice(0, room); }
    return stem + ext;
  }
  /** Append a suffix before the extension: "a.pdf" + "-compressed" -> "a-compressed.pdf". */
  function withSuffix(name, suffix, fallback) {
    var safe = safeFilename(name, fallback || 'download', 120);
    var s = suffix || '';
    var dot = safe.lastIndexOf('.');
    if (dot <= 0) { return safe + s; }
    return safe.slice(0, dot) + s + safe.slice(dot);
  }
  function withinLimit(value, max) { return typeof value === 'number' && isFinite(value) && value > 0 && value <= max; }
  function formatBytes(b) {
    if (typeof b !== 'number' || !isFinite(b) || b < 0) { return '0 B'; }
    if (b < 1024) { return b + ' B'; }
    if (b < 1048576) { return (b / 1024).toFixed(1) + ' KB'; }
    return (b / 1048576).toFixed(2) + ' MB';
  }
  function reductionPercent(original, result) {
    if (!original || !isFinite(original) || !isFinite(result) || original <= 0) { return 0; }
    return Math.round((1 - result / original) * 100);
  }
  /** Safe text setter: never interprets markup. */
  function setText(node, text) { if (node) { node.textContent = text == null ? '' : String(text); } return node; }
  function fireDownload(url, name) {
    var a = document.createElement('a');
    a.href = url; a.download = safeFilename(name, 'download');
    a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }
  return { safeFilename: safeFilename, withSuffix: withSuffix, withinLimit: withinLimit,
           formatBytes: formatBytes, reductionPercent: reductionPercent, setText: setText, fireDownload: fireDownload };
}));
