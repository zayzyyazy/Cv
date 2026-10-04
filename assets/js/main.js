(function () {
  "use strict";

  var PROJECTS = window.PROJECTS || [];
  var bySlug = {};
  PROJECTS.forEach(function (p) { bySlug[p.slug] = p; });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = document.documentElement;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Fill project cards from data ---------- */
  document.querySelectorAll("[data-project]").forEach(function (card) {
    var p = bySlug[card.getAttribute("data-project")];
    if (!p) return;
    card.querySelectorAll("[data-field]").forEach(function (el) {
      var key = el.getAttribute("data-field");
      if (p[key] != null) el.textContent = p[key];
    });
    var btn = card.querySelector(".project-open");
    if (btn) btn.setAttribute("aria-label", "Read the case study: " + p.title);
  });

  /* Deterministic "waveform" for the QA card */
  var wave = document.getElementById("qaWave");
  if (wave) {
    var bars = "";
    for (var i = 0; i < 64; i++) {
      var h = 18 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.19)) * 72 + ((i * 37) % 11);
      bars += '<i style="height:' + Math.min(100, h).toFixed(0) + '%"></i>';
    }
    wave.innerHTML = bars;
  }

  /* ---------- Header state + active section ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var navLinks = document.querySelectorAll(".nav-list a[data-nav]");
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute("data-nav") === id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["top", "work", "experience", "approach", "help", "about", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuButton");
  var menu = document.getElementById("mobileMenu");
  var menuLabel = menuBtn.querySelector(".menu-button-label");

  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Close" : "Menu";
    menu.hidden = !open;
    menu.classList.toggle("is-open", open);
    root.classList.toggle("is-locked", open);
    if (open) {
      menu.querySelectorAll(".mobile-menu-list li").forEach(function (li, i) { li.style.setProperty("--i", i); });
      var first = menu.querySelector("a");
      if (first) first.focus();
    }
  }
  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (menu.hidden) return;
    if (e.key === "Escape") { setMenu(false); menuBtn.focus(); return; }
    if (e.key === "Tab") {
      // keep focus within menu button + menu
      var focusables = [menuBtn].concat(Array.prototype.slice.call(menu.querySelectorAll("a")));
      var idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
      else if (!e.shiftKey && idx === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
    }
  });
  window.matchMedia("(min-width: 820px)").addEventListener("change", function (mq) {
    if (mq.matches && !menu.hidden) setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Approach sorter ---------- */
  var sorter = document.getElementById("sorter");
  if (sorter) {
    var cases = sorter.querySelectorAll(".case");
    var lanes = sorter.querySelectorAll(".lane");
    var result = document.getElementById("sorterResult");
    var laneNames = { ai: "AI", rules: "Code / rules", human: "A person" };

    cases.forEach(function (btn) {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        var lane = btn.getAttribute("data-lane");
        cases.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        lanes.forEach(function (l) {
          var active = l.getAttribute("data-lane") === lane;
          l.classList.toggle("is-active", active);
          var slot = l.querySelector(".lane-slot");
          slot.innerHTML = active ? '<span class="lane-token">' + esc(btn.textContent) + "</span>" : "";
        });
        var from = bySlug[btn.getAttribute("data-from")];
        result.innerHTML =
          "<b>" + esc(laneNames[lane]) + ".</b> " + esc(btn.getAttribute("data-why")) +
          (from ? ' <span class="mono" style="text-transform:none">From</span> <button type="button" data-open="' + from.slug + '">' + esc(from.title) + "</button>" : "");
      });
    });
  }

  /* ---------- Case-study dialog ---------- */
  var dialog = document.getElementById("caseDialog");
  var body = document.getElementById("caseBody");
  var barNum = document.getElementById("caseBarNum");
  var barCat = document.getElementById("caseBarCat");
  var closeBtn = document.getElementById("caseClose");
  var currentSlug = null;
  var returnFocusEl = null;
  var HASH_PREFIX = "#project/";

  function renderFlow(flow) {
    return '<ol class="flow">' + flow.map(function (s, i) {
      return '<li class="flow-step' + (s.branch ? " is-branch" : "") + '" data-kind="' + s.kind + '" style="--i:' + i + '">' +
        '<span class="flow-marker" aria-hidden="true"></span>' +
        '<span class="flow-label">' + esc(s.label) + "</span>" +
        '<span class="flow-title">' + esc(s.title) + (s.note ? '<span class="flow-note">' + esc(s.note) + "</span>" : "") + "</span>" +
        "</li>";
    }).join("") + "</ol>" +
    '<p class="flow-legend" aria-hidden="true"><span><i></i>step</span><span class="l-rule"><i></i>rule / code</span><span class="l-ai"><i></i>AI</span><span class="l-human"><i></i>person / exception</span></p>';
  }

  function render(p) {
    var idx = PROJECTS.indexOf(p);
    var prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    var next = PROJECTS[(idx + 1) % PROJECTS.length];

    var links = "";
    if (p.repo) links += '<a class="btn btn-primary" href="' + p.repo + '" target="_blank" rel="noopener">View repository <span aria-hidden="true">↗</span></a>';
    if (p.demo) links += '<a class="btn btn-ghost" href="' + p.demo + '" target="_blank" rel="noopener">View live demo <span aria-hidden="true">↗</span></a>';

    var media = "";
    if (p.media && p.media.length) {
      media = '<section class="cs-block cs-wide"><h3 class="mono">Screenshots</h3><div class="cs-media' + (p.media.length > 1 ? " has-two" : "") + '">' +
        p.media.map(function (m) {
          return '<figure><div class="shot"><img src="' + m.src + '" width="' + m.w + '" height="' + m.h + '" alt="' + esc(m.alt) + '" loading="lazy" decoding="async"></div><figcaption>' + esc(m.caption) + "</figcaption></figure>";
        }).join("") + "</div></section>";
    }

    var sample = p.sample
      ? '<figure class="cs-sample"><figcaption class="mono">' + esc(p.sample.label) + "</figcaption><pre><code>" + esc(p.sample.code) + "</code></pre></figure>"
      : "";

    body.innerHTML =
      '<header class="cs-head">' +
        '<span class="cs-num" aria-hidden="true">' + p.number + "</span>" +
        '<h2 class="cs-title" id="caseTitle" tabindex="-1">' + esc(p.title) + "</h2>" +
        '<p class="cs-tagline">' + esc(p.tagline) + "</p>" +
        '<div class="cs-facts"><span class="cs-status"><span class="visually-hidden">Status: </span>' + esc(p.status) + "</span>" +
        (links ? '<div class="cs-links">' + links + "</div>" : "") + "</div>" +
      "</header>" +
      '<div class="cs-grid">' +
        '<section class="cs-block"><h3 class="mono">The problem</h3><p>' + esc(p.problem) + "</p></section>" +
        '<section class="cs-block"><h3 class="mono">The system</h3><p>' + esc(p.system) + "</p></section>" +
        '<section class="cs-block"><h3 class="mono">How it works</h3>' + renderFlow(p.flow) + "</section>" +
        '<div class="cs-side">' +
          '<section class="cs-block"><h3 class="mono">What I built</h3><ul>' + p.built.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul></section>" +
          '<section class="cs-block" style="margin-top:var(--s-7)"><h3 class="mono">Stack</h3><ul class="cs-stack">' + p.stack.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></section>" +
        "</div>" +
        '<section class="cs-block cs-block--quote cs-wide"><h3 class="mono">The interesting part</h3><p>' + esc(p.interesting) + "</p>" + sample + "</section>" +
        media +
      "</div>" +
      '<nav class="cs-nav" aria-label="More projects">' +
        '<button type="button" data-goto="' + prev.slug + '"><span class="mono">← Previous</span><b>' + esc(prev.title) + "</b></button>" +
        '<button type="button" data-goto="' + next.slug + '"><span class="mono">Next →</span><b>' + esc(next.title) + "</b></button>" +
      "</nav>";

    barNum.textContent = p.number;
    barCat.textContent = "· " + p.category;
    body.scrollTop = 0;
  }

  function openProject(slug, opts) {
    var p = bySlug[slug];
    if (!p) return;
    opts = opts || {};
    if (!dialog.open) returnFocusEl = opts.trigger || document.activeElement;
    currentSlug = slug;
    render(p);

    if (opts.history === "push") history.pushState({ project: slug }, "", HASH_PREFIX + slug);
    else if (opts.history === "replace") history.replaceState(history.state && history.state.project ? { project: slug } : null, "", HASH_PREFIX + slug);

    if (!dialog.open) {
      dialog.classList.remove("is-closing");
      dialog.showModal();
      root.classList.add("is-locked");
    } else if (!reduceMotion.matches) {
      // replay the panel entrance when switching projects
      var panel = document.getElementById("casePanel");
      panel.style.animation = "none";
      void panel.offsetWidth;
      panel.style.animation = "";
    }
    var title = document.getElementById("caseTitle");
    if (title) title.focus({ preventScroll: true });
  }

  function finishClose() {
    dialog.classList.remove("is-closing");
    if (dialog.open) dialog.close();
    root.classList.remove("is-locked");
    var target = returnFocusEl;
    // If the visitor browsed to another project, return focus to that project's card
    var card = document.querySelector('.projects [data-open="' + currentSlug + '"]');
    if (card && (!target || target.getAttribute("data-open") !== currentSlug)) target = card;
    if (target && document.contains(target)) {
      target.focus({ preventScroll: target === returnFocusEl });
      if (target !== returnFocusEl) target.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
    currentSlug = null;
    returnFocusEl = null;
  }

  function animateClose() {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    if (reduceMotion.matches) { finishClose(); return; }
    dialog.classList.add("is-closing");
    setTimeout(finishClose, 230);
  }

  // User-initiated close: keep the URL / history in sync
  function requestClose() {
    if (history.state && history.state.project) {
      history.back(); // popstate will close
    } else {
      history.replaceState(null, "", "#work");
      animateClose();
    }
  }

  window.addEventListener("popstate", function () {
    var slug = location.hash.indexOf(HASH_PREFIX) === 0 ? location.hash.slice(HASH_PREFIX.length) : null;
    if (slug && bySlug[slug]) openProject(slug, { history: "none" });
    else if (dialog.open) animateClose();
  });

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open]");
    if (opener) {
      e.preventDefault();
      openProject(opener.getAttribute("data-open"), { history: dialog.open ? "replace" : "push", trigger: opener });
      return;
    }
    var goto = e.target.closest("[data-goto]");
    if (goto) openProject(goto.getAttribute("data-goto"), { history: "replace" });
  });

  closeBtn.addEventListener("click", requestClose);
  dialog.addEventListener("cancel", function (e) { e.preventDefault(); requestClose(); });
  // Click on the backdrop (outside the panel) closes
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) requestClose();
  });

  // Deep link: /#project/waybill
  if (location.hash.indexOf(HASH_PREFIX) === 0) {
    var initial = location.hash.slice(HASH_PREFIX.length);
    if (bySlug[initial]) openProject(initial, { history: "none" });
  }
})();
