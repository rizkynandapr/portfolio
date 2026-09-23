// Runs before first paint (blocking, from <head>) so the page never flashes
// the wrong theme. External file rather than inline, to keep CSP script-src 'self'.
(function () {
  var t = null;
  try { t = localStorage.getItem("theme"); } catch { t = null; }
  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', t);
})();
