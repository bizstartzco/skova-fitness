/* Skova Fitness — shared behaviour for every page. Depends on js/config.js. */
window.Skova = (function(){
  var $ = function(id){ return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pick(key){
    var real = SITE[key];
    var empty = !real || (Array.isArray(real) ? real.length === 0 : (typeof real === "object" ? Object.keys(real).length === 0 : !String(real).trim()));
    if (!empty) return { data: real, sample: false };
    if (SHOW_SAMPLES && SAMPLE[key] !== undefined) return { data: SAMPLE[key], sample: true };
    return { data: null, sample: false };
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]; }); }
  function wa(text){ return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text); }
  function npr(n){ return "NPR " + Number(n).toLocaleString("en-IN"); }

  /* animated number: writes into a text node over ~600ms */
  function countTo(node, to, decimals){
    decimals = decimals || 0;
    var from = parseFloat(String(node.nodeValue).replace(/[^\d.\-]/g, "")) || 0;
    if (reduce) { node.nodeValue = decimals ? to.toFixed(decimals) : Math.round(to).toLocaleString("en-IN"); return; }
    var start = performance.now(), dur = 600;
    function tick(t){
      var k = Math.min(1, (t - start) / dur); k = 1 - Math.pow(1 - k, 3);
      var v = from + (to - from) * k;
      node.nodeValue = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN");
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* rising copper embers on a canvas: cheap, ~30fps, paused when the tab is hidden */
  function embers(canvas){
    var ctx = canvas.getContext("2d"); if (!ctx) return;
    var W = 0, H = 0, parts = [], last = 0, running = true;
    function size(){ W = canvas.width = Math.round(window.innerWidth / 2); H = canvas.height = Math.round(window.innerHeight / 2); }
    function spawn(anywhere){ return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 6, r: 0.6 + Math.random() * 1.8, vy: 0.12 + Math.random() * 0.4, sway: Math.random() * 6.28, a: 0.25 + Math.random() * 0.6, slate: Math.random() < 0.18 }; }
    size(); var count = window.innerWidth < 700 ? 26 : 56; for (var i = 0; i < count; i++) parts.push(spawn(true));
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", function(){ running = !document.hidden; if (running) requestAnimationFrame(tick); });
    function tick(t){
      if (!running) return;
      if (t - last > 33) {
        last = t; ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter";
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i]; p.y -= p.vy; p.sway += 0.015; p.x += Math.sin(p.sway) * 0.18;
          if (p.y < -8) parts[i] = p = spawn(false);
          var fade = Math.min(1, p.y / (H * 0.25)) * p.a, rgb = p.slate ? "140,170,185" : "232,156,96";
          ctx.fillStyle = "rgba(" + rgb + "," + (fade * 0.16).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "rgba(" + rgb + "," + fade.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function init(){
    /* year */
    var y = $("year"); if (y) y.textContent = new Date().getFullYear();

    /* burger + full-screen menu */
    var burger = $("burger"), menu = $("menu");
    if (burger && menu) {
      var closeMenu = function(){ burger.setAttribute("aria-expanded","false"); burger.setAttribute("aria-label","Open menu"); menu.classList.remove("open"); document.body.style.overflow = ""; };
      burger.addEventListener("click", function(){
        var open = burger.getAttribute("aria-expanded") === "true";
        if (open) closeMenu(); else { burger.setAttribute("aria-expanded","true"); burger.setAttribute("aria-label","Close menu"); menu.classList.add("open"); document.body.style.overflow = "hidden"; }
      });
      menu.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeMenu); });
      document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });
    }

    /* active nav link by section */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll("#nav-links a[href^='#']"));
    if (navLinks.length && "IntersectionObserver" in window) {
      var secIO = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if (en.isIntersecting) navLinks.forEach(function(a){ a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id ? "true" : "false"); }); });
      }, { rootMargin: "-40% 0px -55% 0px" });
      navLinks.forEach(function(a){ var s = document.querySelector(a.getAttribute("href")); if (s) secIO.observe(s); });
    }

    /* copy buttons */
    document.querySelectorAll("[data-copy-target]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var text = SITE[btn.getAttribute("data-copy-target")] || "";
        var done = function(){ btn.textContent = "Copied"; setTimeout(function(){ btn.textContent = "Copy"; }, 1600); };
        function selectText(){ var r = document.createRange(); r.selectNodeContents(btn.previousElementSibling); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(selectText); else selectText();
      });
    });

    /* WhatsApp links */
    if (SITE.whatsapp) {
      document.querySelectorAll("[data-wa]").forEach(function(a){ a.href = wa(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener"; });
    }

    /* back to top */
    var totop = $("totop");
    if (totop) {
      totop.addEventListener("click", function(){ window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
      var sentinel = document.querySelector("[data-top-sentinel]") || document.querySelector("main > section");
      if (sentinel && "IntersectionObserver" in window) { new IntersectionObserver(function(en){ totop.classList.toggle("show", !en[0].isIntersecting); }).observe(sentinel); }
    }

    /* ambient backdrop: light orbs, sweep, equipment silhouettes, embers */
    var bg = document.querySelector(".bg");
    if (bg && !bg.querySelector(".orb")) {
      var PLATE = "<circle cx='50' cy='50' r='46'/><circle cx='50' cy='50' r='30'/><circle cx='50' cy='50' r='9'/><path d='M50 4v17M50 79v17M4 50h17M79 50h17'/>";
      var DUMB = "<rect x='6' y='22' width='16' height='56' rx='4'/><rect x='22' y='30' width='12' height='40' rx='3'/><rect x='178' y='22' width='16' height='56' rx='4'/><rect x='166' y='30' width='12' height='40' rx='3'/><path d='M34 50h132'/>";
      var KETTLE = "<path d='M28 46c-7-24 2-40 22-40s29 16 22 40'/><circle cx='50' cy='68' r='34'/>";
      bg.insertAdjacentHTML("beforeend",
        "<span class='orb o1'></span><span class='orb o2'></span><span class='orb o3'></span><span class='sweep'></span>" +
        "<div class='bg-gear'>" +
          "<svg viewBox='0 0 100 100' style='left:-6%;top:18%;width:min(34vw,420px);--d:90s'>" + PLATE + "</svg>" +
          "<svg class='slate' viewBox='0 0 100 100' style='right:-8%;top:52%;width:min(40vw,520px);--d:120s;animation-direction:reverse'>" + PLATE + "</svg>" +
          "<svg class='float' viewBox='0 0 200 100' style='right:6%;top:9%;width:min(30vw,360px);--d:16s'>" + DUMB + "</svg>" +
          "<svg class='float slate' viewBox='0 0 200 100' style='left:8%;top:68%;width:min(26vw,300px);--d:19s'>" + DUMB + "</svg>" +
          "<svg class='float' viewBox='0 0 100 104' style='left:44%;top:38%;width:min(14vw,170px);--d:13s'>" + KETTLE + "</svg>" +
          "<svg viewBox='0 0 100 100' style='left:30%;top:88%;width:min(18vw,220px);--d:70s'>" + PLATE + "</svg>" +
        "</div><canvas class='embers'></canvas>");
      if (!reduce) {
        var gearLayer = bg.querySelector(".bg-gear"), ticking = false;
        window.addEventListener("scroll", function(){ if (ticking) return; ticking = true; requestAnimationFrame(function(){ gearLayer.style.setProperty("--sy", window.scrollY.toFixed(0)); ticking = false; }); }, { passive: true });
        embers(bg.querySelector(".embers"));
      }
    }

    /* hero equipment parallax */
    var field = document.querySelector(".gear-field");
    if (field && !reduce && window.matchMedia("(pointer:fine)").matches) {
      var host = field.parentElement;
      host.addEventListener("pointermove", function(e){
        var r = host.getBoundingClientRect();
        var mx = ((e.clientX - r.left) / r.width - .5) * 28, my = ((e.clientY - r.top) / r.height - .5) * 18;
        field.style.setProperty("--mx", mx.toFixed(1)); field.style.setProperty("--my", my.toFixed(1));
      });
      host.addEventListener("pointerleave", function(){ field.style.setProperty("--mx", 0); field.style.setProperty("--my", 0); });
    }

    /* barbell dividers load their plates when they scroll into view */
    var bars = document.querySelectorAll(".bar-divider");
    if (bars.length && "IntersectionObserver" in window && !reduce) {
      var barIO = new IntersectionObserver(function(entries){ entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("loaded"); barIO.unobserve(en.target); } }); }, { threshold: .6 });
      bars.forEach(function(b){ barIO.observe(b); });
    } else { bars.forEach(function(b){ b.classList.add("loaded"); }); }

    /* reveal below the fold only; never tag elements inside <details> */
    if (!reduce && "IntersectionObserver" in window) {
      var vh = window.innerHeight;
      var targets = document.querySelectorAll("[data-reveal], .cell, .note, .plan, .addon, .program, .step, .coach, .tile, .stat, .card, .section-head, .visit-info, .form-shell, .calc-form, .tt-wrap, .faq");
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      targets.forEach(function(el, i){
        if (el.closest("details")) return;
        if (el.getBoundingClientRect().top > vh) { el.classList.add("will-reveal"); el.style.transitionDelay = ((i % 4) * 70) + "ms"; io.observe(el); }
      });
    }
  }

  return { $: $, pick: pick, esc: esc, wa: wa, npr: npr, countTo: countTo, reduce: reduce, init: init };
})();
