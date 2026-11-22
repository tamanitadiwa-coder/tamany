/* ==========================================================================
   TAMANY — Interaction & motion
   Progressive: everything is readable without JS or with reduced motion.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var motion = root.classList.contains("motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  window.__tamanyReady = true;

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Navigation ---------- */
  var nav = document.querySelector(".nav");
  var menuBtn = document.querySelector(".nav__menu");
  var menu = document.getElementById("menu");
  var lastY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    if (!nav) return;
    nav.classList.toggle("is-scrolled", y > 24);
    if (!body.classList.contains("menu-open")) {
      nav.classList.toggle("is-hidden", y > window.innerHeight * 0.7 && y > lastY + 2);
      if (y < lastY - 2) nav.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector("[data-menu-label]").textContent = open ? "Close" : "Menu";
    menu.setAttribute("aria-hidden", String(!open));
    if (open) { menu.removeAttribute("inert"); var first = menu.querySelector("a"); if (first) setTimeout(function () { first.focus(); }, 300); }
    else { menu.setAttribute("inert", ""); }
    if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && body.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); } });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  /* ---------- In-page anchors (works with or without smooth scroll) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      else target.scrollIntoView({ behavior: motion ? "smooth" : "auto" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Page transitions ---------- */
  var curtain = document.querySelector(".curtain");
  function isInternal(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:\/\/(?!(www\.)?tamany\.tech))/i.test(href)) return false;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.hash) return false;
    return true;
  }
  if (curtain && motion && hasGSAP) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var a = e.target.closest("a");
      if (!isInternal(a)) return;
      e.preventDefault();
      try { sessionStorage.setItem("tmy-t", "1"); } catch (err) {}
      gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power4.inOut", onComplete: function () { location.href = a.href; } });
    });
    if (root.classList.contains("is-entering")) {
      gsap.set(curtain, { yPercent: 0 });
      root.classList.remove("is-entering");
      gsap.to(curtain, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.05 });
    }
    window.addEventListener("pageshow", function (e) { if (e.persisted) gsap.set(curtain, { yPercent: 100 }); });
  } else {
    root.classList.remove("is-entering");
  }

  /* ---------- Process step state (no GSAP needed) ---------- */
  var steps = document.querySelectorAll(".step");
  var countEl = document.querySelector(".process__count span");
  if (steps.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          steps.forEach(function (s) { s.classList.remove("is-active"); });
          en.target.classList.add("is-active");
          if (countEl) countEl.textContent = en.target.getAttribute("data-step");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Package budget chips + enquiry form ---------- */
  initBudget();
  initEnquiry();

  /* ---------- Everything below needs GSAP + motion ---------- */
  if (!motion || !hasGSAP) { root.classList.remove("motion"); return; }

  gsap.registerPlugin(ScrollTrigger);
  var mm = gsap.matchMedia();

  /* Smooth scroll on desktop pointers only */
  if (finePointer && window.innerWidth > 900 && typeof window.Lenis !== "undefined") {
    var lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Hero entrance */
  var hero = document.querySelector(".hero");
  if (hero) {
    var tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: sessionStorage.getItem("tmy-t") ? 0.45 : 0.15 });
    tl.to(".wordmark span", { yPercent: 0, y: 0, duration: 1.6, stagger: 0.07 }, 0)
      .to(".hero__title .ln > span", { y: 0, yPercent: 0, duration: 1.4, stagger: 0.1 }, 0.35)
      .to(hero.querySelectorAll("[data-reveal]"), { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.7);
    gsap.set(".wordmark span", { yPercent: 105 });
    gsap.set(".hero__title .ln > span", { yPercent: 110 });

    gsap.to(".hero .wordmark", { yPercent: -18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__top", { y: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "70% top", scrub: true } });
    gsap.to(".hero__mark", { rotate: 18, y: 120, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__light", { yPercent: 30, opacity: 0.4, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }
  try { sessionStorage.removeItem("tmy-t"); } catch (err) {}

  /* Generic reveals (outside hero) */
  var reveals = gsap.utils.toArray("[data-reveal]").filter(function (el) { return !el.closest(".hero"); });
  ScrollTrigger.batch(reveals, {
    start: "top 88%",
    once: true,
    onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, overwrite: true }); }
  });

  /* Image frames: clip reveal */
  gsap.utils.toArray("[data-clip]").forEach(function (el) {
    gsap.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });

  /* Parallax images inside frames */
  gsap.utils.toArray("[data-speed]").forEach(function (img) {
    var s = parseFloat(img.getAttribute("data-speed")) || 1;
    gsap.fromTo(img, { yPercent: -7 * s }, { yPercent: 7 * s, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });
  /* Whole-element drift (different scroll speeds) */
  gsap.utils.toArray("[data-drift]").forEach(function (el) {
    var d = parseFloat(el.getAttribute("data-drift")) || 60;
    gsap.fromTo(el, { y: d }, { y: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* Intro statement: words light up as you read */
  var introText = document.querySelector("[data-words]");
  if (introText) {
    splitWords(introText);
    var words = introText.querySelectorAll(".w");
    gsap.to(words, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: introText, start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
  }

  /* Philosophy lines */
  var philo = document.querySelector(".philo__words");
  if (philo) {
    gsap.from(philo.querySelectorAll(".line > span"), { yPercent: 105, duration: 1.4, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: philo, start: "top 80%", once: true } });
    philo.querySelectorAll(".line").forEach(function (line, i) {
      gsap.to(line, { x: (i % 2 ? -1 : 1) * window.innerWidth * 0.04, ease: "none", scrollTrigger: { trigger: philo, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  /* Process line fill */
  var pl = document.querySelector(".process__line span");
  if (pl) gsap.to(pl, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".process__list", start: "top 55%", end: "bottom 55%", scrub: true } });

  /* Footer wordmark */
  var fw = document.querySelector(".footer__word");
  if (fw) gsap.fromTo(fw, { yPercent: 30 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: fw, start: "top bottom", end: "bottom bottom", scrub: true } });

  /* Contact title */
  var ct = document.querySelector(".contact__title");
  if (ct) gsap.from(ct.querySelectorAll(".ln > span"), { yPercent: 110, duration: 1.5, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ct, start: "top 85%", once: true } });

  /* Subpage hero title */
  var ph = document.querySelector(".page-hero h1");
  if (ph) gsap.from(ph.querySelectorAll(".ln > span"), { yPercent: 110, duration: 1.5, ease: "expo.out", stagger: 0.1, delay: 0.25 });

  /* Desktop-only: services cursor preview + pinned horizontal work */
  mm.add("(min-width: 901px) and (hover: hover) and (pointer: fine)", function () {
    var preview = document.querySelector(".svc-preview");
    var list = document.querySelector(".services__list");
    if (preview && list) {
      var imgs = preview.querySelectorAll("img");
      var xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
      var yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
      var move = function (e) { xTo(e.clientX); yTo(e.clientY); };
      list.addEventListener("mousemove", move);
      list.addEventListener("mouseenter", function (e) { gsap.set(preview, { x: e.clientX, y: e.clientY }); gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: "power3" }); });
      list.addEventListener("mouseleave", function () { gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.4, ease: "power3" }); });
      list.querySelectorAll(".svc").forEach(function (row, i) {
        row.addEventListener("mouseenter", function () { imgs.forEach(function (im, j) { im.classList.toggle("is-active", i === j); }); });
      });
    }

    var work = document.querySelector(".work");
    var track = document.querySelector(".work__track");
    var bar = document.querySelector(".work__progress span");
    if (work && track) {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); },
        ease: "none",
        scrollTrigger: { trigger: ".work__pin", start: "center center", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      if (bar) gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".work__pin", start: "center center", end: function () { return "+=" + dist(); }, scrub: true, invalidateOnRefresh: true } });
      return function () { tween.kill(); gsap.set(track, { clearProps: "transform" }); };
    }
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

  /* ---------- helpers ---------- */
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement("span");
        s.className = "w"; s.textContent = part;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
})();

/* ---------- Packages: budget chips ---------- */
function initBudget() {
  var chips = document.querySelectorAll("[data-budget]");
  if (!chips.length) return;
  var out = document.getElementById("budgetPrice");
  var btn = document.getElementById("budgetEnquire");
  var selected = chips[0].getAttribute("data-budget");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      c.setAttribute("aria-pressed", "true");
      selected = c.getAttribute("data-budget");
      if (out) out.textContent = selected;
      if (btn) btn.href = waLink("Hi Tamany, I’m interested in a Small Budget Website. My budget is " + selected + ".");
    });
  });
  if (btn) btn.href = waLink("Hi Tamany, I’m interested in a Small Budget Website. My budget is " + selected + ".");
}

/* ---------- Enquiry form: composes a WhatsApp or email message ---------- */
function initEnquiry() {
  var form = document.getElementById("enquiry");
  if (!form) return;
  var params = new URLSearchParams(location.search);
  var pkg = params.get("package");
  var sel = form.querySelector("#f-package");
  if (pkg && sel) {
    var match = Array.prototype.find.call(sel.options, function (o) { return o.value && (o.value === pkg || pkg.indexOf(o.value) === 0); });
    if (!match) { match = new Option(pkg, pkg); sel.add(match, 1); }
    sel.value = match.value;
  }

  function compose() {
    var v = function (id) { var el = form.querySelector(id); return el ? el.value.trim() : ""; };
    var lines = [
      "Hi Tamany, I\u2019d like to enquire about a website.",
      "",
      "Name: " + v("#f-name"),
      v("#f-business") ? "Business: " + v("#f-business") : null,
      "Package: " + (v("#f-package") || "Not sure yet"),
      v("#f-contact") ? "Reach me at: " + v("#f-contact") : null,
      "",
      v("#f-message")
    ];
    return lines.filter(function (l) { return l !== null; }).join("\n");
  }
  function valid() {
    var ok = true;
    ["#f-name", "#f-message"].forEach(function (id) {
      var el = form.querySelector(id);
      var bad = !el.value.trim();
      el.closest(".field").classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", String(bad));
      if (bad && ok) { el.focus(); ok = false; }
    });
    return ok;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!valid()) return;
    var via = (e.submitter && e.submitter.value) || "whatsapp";
    var text = compose();
    if (via === "email") {
      location.href = "mailto:tamanitadiwa@gmail.com?subject=" + encodeURIComponent("Website enquiry — " + (form.querySelector("#f-package").value || "General")) + "&body=" + encodeURIComponent(text);
    } else {
      window.open(waLink(text), "_blank", "noopener");
    }
  });
  form.querySelectorAll("input,textarea").forEach(function (el) {
    el.addEventListener("input", function () { el.closest(".field").classList.remove("is-invalid"); el.removeAttribute("aria-invalid"); });
  });
}

function waLink(text) { return "https://wa.me/27842818624?text=" + encodeURIComponent(text); }
