(function () {
  // Theme toggle
  var btn = document.getElementById('theme');
  function setTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); try { localStorage.setItem('theme', t || 'light'); } catch (e) {} }
  if (btn) btn.addEventListener('click', function () { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });

  // Search
  var q = document.getElementById('q'), box = document.getElementById('results'), idx = null, root = window.SITE_ROOT || '.';
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load(cb) { if (idx) return cb(); fetch(root + '/search.json').then(function (r) { return r.json(); }).then(function (d) { idx = d; cb(); }).catch(function () {}); }
  function run() {
    var term = q.value.trim().toLowerCase();
    if (!term) { box.hidden = true; return; }
    load(function () {
      var words = term.split(/\s+/);
      var hits = idx.map(function (a) {
        var t = a.t.toLowerCase(), s = a.s.toLowerCase(), score = 0;
        words.forEach(function (w) { if (t.indexOf(w) >= 0) score += 10; var n = s.split(w).length - 1; score += Math.min(n, 5); });
        return { a: a, score: score };
      }).filter(function (h) { return h.score > 0; }).sort(function (x, y) { return y.score - x.score; }).slice(0, 10);
      box.innerHTML = hits.length ? hits.map(function (h) {
        var i = h.a.s.toLowerCase().indexOf(words[0]), snip = i >= 0 ? h.a.s.slice(Math.max(0, i - 60), i + 90) : h.a.s.slice(0, 150);
        return '<a href="' + root + '/' + h.a.u + '"><strong>' + esc(h.a.t) + '</strong> <span class="rc">' + esc(h.a.c) + '</span><span class="rs">…' + esc(snip) + '…</span></a>';
      }).join('') : '<a><span class="rc">No results</span></a>';
      box.hidden = false;
    });
  }
  if (q) { q.addEventListener('input', run); q.addEventListener('focus', run); document.addEventListener('click', function (e) { if (!e.target.closest('.search')) box.hidden = true; }); q.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.hidden = true; }); }
})();
