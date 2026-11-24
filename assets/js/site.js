/* TAMANY — quiet motion. Everything works without it. */
(function () {
  "use strict";
  var root = document.documentElement;
  var body = document.body;
  var motion = root.classList.contains("motion");
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  window.__tamanyReady = true;

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Nav: solid after scrolling, tucks away while reading */
  var nav = document.querySelector(".nav");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    if (!body.classList.contains("menu-open")) {
      if (y > window.innerHeight * 0.8 && y > lastY + 4) nav.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 80) nav.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var btn = document.querySelector(".nav__menu");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Menu";
    if (open) { menu.removeAttribute("inert"); menu.setAttribute("aria-hidden", "false"); }
    else { menu.setAttribute("inert", ""); menu.setAttribute("aria-hidden", "true"); }
    if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
  }
  if (btn && menu) {
    btn.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && body.classList.contains("menu-open")) { setMenu(false); btn.focus(); } });
  }

  /* Same-page anchors */
  document.querySelectorAll('a[href*="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      var t = document.querySelector(url.hash);
      if (!t) return;
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(t, { duration: 1.4 });
      else t.scrollIntoView({ behavior: motion ? "smooth" : "auto" });
      history.replaceState(null, "", url.hash);
    });
  });

  initBudget();
  initEnquiry();
  initLevels();
  initRecentWork();

  /* Floating Packages bubble: appears after the hero, steps aside near the footer */
  var fpk = document.querySelector(".float-pk");
  var heroEl = document.querySelector(".hero");
  var foot = document.querySelector(".footer");
  if (fpk && heroEl) {
    var tog = function () {
      var past = window.scrollY > heroEl.offsetHeight * 0.7;
      var nearEnd = foot && foot.getBoundingClientRect().top < window.innerHeight - 20;
      fpk.classList.toggle("is-on", past && !nearEnd);
    };
    window.addEventListener("scroll", tog, { passive: true });
    tog();
  }

  if (!motion || !hasGSAP) { root.classList.remove("motion"); return; }
  gsap.registerPlugin(ScrollTrigger);
  var desktop = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches;

  /* Smooth scrolling only for mouse/trackpad; phones keep native scrolling */
  if (desktop && typeof window.Lenis !== "undefined") {
    var lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Hero: a slow, single opening */
  var hero = document.querySelector(".hero");
  if (hero) {
    var tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });
    tl.fromTo(".hero .wordmark", { opacity: 0, letterSpacing: "0.6em", marginRight: "-0.6em" }, { opacity: 1, letterSpacing: "0.36em", marginRight: "-0.36em", duration: 2.2, ease: "expo.out" }, 0)
      .fromTo(".hero__tag", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.4 }, 0.6)
      .fromTo(".hero .demo", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.2 }, 0.9)
      .fromTo(".hero__media", { clipPath: "inset(18% 8% 18% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2, ease: "expo.inOut" }, 0.3)
      .fromTo(".hero__media img", { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "expo.out" }, 0.3)
      .fromTo(".hero__foot > *", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12 }, 1.2);
    gsap.to(".hero__head", { yPercent: -40, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }

  /* Text: a gentle rise, once */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 90%", once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.3, ease: "power3.out", stagger: 0.09, overwrite: true }); }
  });

  /* Headlines: each line rises out of its own mask */
  var masks = gsap.utils.toArray(".mask > span");
  gsap.set(masks, { y: 0, yPercent: 108 });
  ScrollTrigger.batch(".mask", {
    start: "top 92%", once: true,
    onEnter: function (els) {
      gsap.to(els.map(function (m) { return m.firstElementChild; }), { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.12, delay: 0.05 });
    }
  });

  /* Images: reveal from the bottom edge */
  gsap.utils.toArray("[data-clip]").forEach(function (el) {
    gsap.to(el, { clipPath: "inset(0 0 0% 0)", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });

  /* Parallax: transform-only, smaller range on phones */
  var range = desktop ? 7 : 4;
  gsap.utils.toArray("[data-speed]").forEach(function (img) {
    var s = parseFloat(img.getAttribute("data-speed")) || 1;
    gsap.fromTo(img, { yPercent: -range * s }, { yPercent: range * s, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: desktop ? true : 0.3 } });
  });

  /* Approach lines drift apart slightly */
  gsap.utils.toArray(".principles li").forEach(function (li, i) {
    gsap.fromTo(li, { x: (i - 1) * -14 }, { x: (i - 1) * 14, ease: "none", scrollTrigger: { trigger: ".principles", start: "top bottom", end: "bottom top", scrub: true } });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();

/* Packages: budget choice prefills WhatsApp */
function initBudget() {
  var chips = document.querySelectorAll("[data-budget]");
  if (!chips.length) return;
  var out = document.getElementById("budgetPrice");
  var link = document.getElementById("budgetEnquire");
  function set(v) { if (out) out.textContent = v; if (link) link.href = waLink("Hi Tamany, I’m interested in a Small Budget Website. My budget is " + v + "."); }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      c.setAttribute("aria-pressed", "true");
      set(c.getAttribute("data-budget"));
    });
  });
  set(chips[0].getAttribute("data-budget"));
}

/* Enquiry: choose options, see the draft, send it as a quote request. Nothing stored. */
function initEnquiry() {
  var form = document.getElementById("enquiry");
  if (!form) return;
  var draft = document.getElementById("draft");
  var pkg = new URLSearchParams(location.search).get("package");
  if (pkg) pkg = pkg.split(" \u2014 ")[0];
  var need = new URLSearchParams(location.search).get("need");
  if (need === "demo") { var d = form.querySelector('input[name="help"][value="Request a demo"]'); if (d) d.checked = true; }
  function v(id) { var el = form.querySelector(id); return el ? el.value.trim() : ""; }
  function pick(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function compose() {
    var biz = [pick("biz"), v("#f-business")].filter(Boolean).join(" \u2014 ");
    var lines = [
      pick("help") === "Request a demo" ? "Hi Tamany, I\u2019d like to request a demo." : "Hi Tamany, I\u2019d like a quote.",
      "",
      pick("help") ? "Need: " + pick("help") : null,
      biz ? "Business: " + biz : null,
      pick("site") ? "Website: " + pick("site") : null,
      pkg ? "Interested in: " + pkg : null,
      pick("domain") ? "Domain & hosting: " + pick("domain") : null,
      v("#f-ig") ? "Instagram: " + (v("#f-ig").charAt(0) === "@" ? "" : "@") + v("#f-ig") : null,
      form.querySelector("#f-photos") && form.querySelector("#f-photos").checked ? "I\u2019ll send photos of my business here." : null,
      v("#f-message") ? "\n" + v("#f-message") : null,
      "",
      v("#f-name") ? "\u2014 " + v("#f-name") : null,
      v("#f-contact") ? v("#f-contact") : null
    ];
    return lines.filter(function (l) { return l !== null; }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function render() { if (draft) draft.textContent = compose(); }
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  render();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.querySelector("#f-name");
    if (!name.value.trim()) {
      name.closest(".field").classList.add("is-invalid");
      name.setAttribute("aria-invalid", "true");
      name.focus();
      return;
    }
    var text = compose();
    var via = (e.submitter && e.submitter.value) || "whatsapp";
    if (via === "email") location.href = "mailto:tamanitadiwa@gmail.com?subject=" + encodeURIComponent("Quote request" + (pick("site") ? " \u2014 " + pick("site") : "")) + "&body=" + encodeURIComponent(text);
    else window.open(waLink(text), "_blank", "noopener");
  });
  form.querySelectorAll("input,textarea").forEach(function (el) {
    el.addEventListener("input", function () { var f = el.closest(".field"); if (f) f.classList.remove("is-invalid"); el.removeAttribute("aria-invalid"); });
  });
}
function waLink(t) { return "https://wa.me/27842818624?text=" + encodeURIComponent(t); }

/* Packages: level slider shows what each price includes */
function initLevels() {
  var range = document.getElementById("level");
  if (!range) return;
  var levels = document.querySelectorAll(".level");
  var ticks = document.querySelectorAll(".tick");
  var slider = range.closest(".slider");
  var current = -1;
  function show(i, animate) {
    i = Math.max(0, Math.min(levels.length - 1, i));
    range.value = i;
    slider.style.setProperty("--p", (i / (levels.length - 1)) * 100 + "%");
    ticks.forEach(function (t, k) { t.classList.toggle("is-on", k === i); });
    if (i === current) return;
    current = i;
    levels.forEach(function (l, k) { l.classList.toggle("is-on", k === i); });
    var on = levels[i];
    range.setAttribute("aria-valuetext", on.getAttribute("data-name"));
    var g = window.gsap;
    if (animate && g && document.documentElement.classList.contains("motion")) {
      g.fromTo(on.querySelector(".level__price"), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" });
      g.fromTo(on.querySelectorAll(".level__list li, .level__host, .level__actions"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.035 });
    }
  }
  range.addEventListener("input", function () { show(parseInt(range.value, 10), true); });
  ticks.forEach(function (t) { t.addEventListener("click", function () { show(parseInt(t.getAttribute("data-go"), 10), true); }); });
  show(0, false);
}

/* Recent work: lazy-load the phone videos, play only on screen, rAF parallax */
function initRecentWork() {
  var section = document.getElementById("recent");
  if (!section) return;
  var vids = Array.prototype.slice.call(section.querySelectorAll("video"));
  var phones = Array.prototype.slice.call(section.querySelectorAll(".phone"));
  var ua = navigator.userAgent;
  var isIOS = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isSafari = /^((?!chrome|chromium|crios|fxios|edg|android).)*safari/i.test(ua);
  // WebKit can't show VP9 transparency, so it gets the MP4 on the page colour.
  var probe = document.createElement("video");
  var useWebm = !isIOS && !isSafari && probe.canPlayType('video/webm; codecs="vp9"') !== "";

  function load(v) {
    if (v.dataset.loaded) return;
    v.dataset.loaded = "1";
    v.muted = true;
    v.src = useWebm ? v.dataset.webm : v.dataset.mp4;
    v.load();
  }
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  if ("IntersectionObserver" in window) {
    var near = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); near.unobserve(e.target); } });
    }, { rootMargin: "300px 0px" });
    var vis = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { load(e.target); play(e.target); } else { e.target.pause(); }
      });
    }, { threshold: 0.15 });
    vids.forEach(function (v) { near.observe(v); vis.observe(v); });
  } else {
    vids.forEach(function (v) { load(v); play(v); });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) vids.forEach(function (v) { v.pause(); });
  });

  /* Parallax: transforms in requestAnimationFrame only; off for reduced motion */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ticking = false, active = false;
  function frame() {
    ticking = false;
    var r = section.getBoundingClientRect();
    var vh = window.innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    var offset = (r.top + r.height / 2) - vh / 2;   // 0 when centred
    phones.forEach(function (ph) {
      var k = parseFloat(ph.getAttribute("data-rate")) || 0.08;
      ph.style.transform = "translate3d(0," + (offset * k).toFixed(2) + "px,0)";
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function setMode() {
    if (reduce.matches) {
      if (active) { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); active = false; }
      phones.forEach(function (ph) { ph.style.transform = ""; });
    } else if (!active) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      active = true; onScroll();
    }
  }
  if (reduce.addEventListener) reduce.addEventListener("change", setMode); else if (reduce.addListener) reduce.addListener(setMode);
  setMode();
}
