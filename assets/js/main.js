(function () {
  "use strict";

  var ALL = window.PROJECTS || [];
  var PROJECTS = ALL.filter(function (p) { return !p.hidden; })
    .sort(function (a, b) { return a.number.localeCompare(b.number); });
  var bySlug = {};
  PROJECTS.forEach(function (p) { bySlug[p.slug] = p; });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = document.documentElement;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Old single-page anchors → real pages ---------- */
  var legacy = { "#work": "/projects/", "#projects": "/projects/", "#experience": "/experience/", "#approach": "/approach/", "#help": "/approach/", "#about": "/approach/", "#contact": "/contact/" };
  if (document.body.getAttribute("data-page") === "home" && legacy[location.hash]) {
    location.replace(legacy[location.hash]);
    return;
  }

  /* ---------- Project cards from shared templates ---------- */
  var templates = window.CARD_TEMPLATES || {};
  document.querySelectorAll("[data-card]").forEach(function (slot) {
    var slug = slot.getAttribute("data-card");
    var p = bySlug[slug];
    if (!p || !templates[slug]) { slot.remove(); return; }
    var tmp = document.createElement("div");
    tmp.innerHTML = templates[slug]();
    var card = tmp.firstElementChild;
    card.querySelectorAll("[data-field]").forEach(function (el) {
      var key = el.getAttribute("data-field");
      if (p[key] != null) el.textContent = p[key];
    });
    var btn = card.querySelector(".project-open");
    if (btn) btn.setAttribute("aria-label", "Read the case study: " + p.title);
    slot.replaceWith(card);
  });

  /* ---------- Header ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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
      var focusables = [menuBtn].concat(Array.prototype.slice.call(menu.querySelectorAll("a")));
      var idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
      else if (!e.shiftKey && idx === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
    }
  });
  window.matchMedia("(min-width: 820px)").addEventListener("change", function (mq) {
    if (mq.matches && !menu.hidden) setMenu(false);
  });
  // Pages restored from the back/forward cache shouldn't come back with the menu open
  window.addEventListener("pageshow", function () { if (!menu.hidden) setMenu(false); });

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
          l.querySelector(".lane-slot").innerHTML = active ? '<span class="lane-token">' + esc(btn.textContent) + "</span>" : "";
        });
        var from = bySlug[btn.getAttribute("data-from")];
        result.innerHTML =
          "<b>" + esc(laneNames[lane]) + ".</b> " + esc(btn.getAttribute("data-why")) +
          (from ? ' <span class="mono" style="text-transform:none">From</span> <button type="button" data-open="' + from.slug + '">' + esc(from.title) + "</button>" : "");
      });
    });
  }

  /* ---------- Case-study dialog + lightbox (created once per page) ---------- */
  document.body.insertAdjacentHTML("beforeend",
    '<dialog class="casefile" id="caseDialog" aria-labelledby="caseTitle">' +
      '<div class="case-panel" id="casePanel">' +
        '<header class="case-bar">' +
          '<p class="case-bar-meta mono"><span id="caseBarNum"></span> <span id="caseBarCat"></span></p>' +
          '<button class="case-close" id="caseClose" type="button" aria-label="Close case study"><span aria-hidden="true">✕</span><span class="case-close-label">Close</span></button>' +
        '</header>' +
        '<div class="case-body" id="caseBody"></div>' +
      '</div>' +
    '</dialog>' +
    '<dialog class="lightbox" id="lightbox" aria-label="Enlarged image">' +
      '<div class="lb-bar">' +
        '<p class="lb-caption" id="lbCaption"></p>' +
        '<div class="lb-actions">' +
          '<button type="button" class="lb-btn" id="lbZoom" aria-pressed="false">Actual size</button>' +
          '<button type="button" class="lb-btn" id="lbClose" aria-label="Close image"><span aria-hidden="true">✕</span><span class="lb-close-label">Close</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="lb-stage" id="lbStage" tabindex="0"></div>' +
    '</dialog>'
  );

  var dialog = document.getElementById("caseDialog");
  var body = document.getElementById("caseBody");
  var barNum = document.getElementById("caseBarNum");
  var barCat = document.getElementById("caseBarCat");
  var closeBtn = document.getElementById("caseClose");
  var lightbox = document.getElementById("lightbox");
  var lbStage = document.getElementById("lbStage");
  var lbCaption = document.getElementById("lbCaption");
  var lbZoom = document.getElementById("lbZoom");
  var lbReturn = null;
  var currentSlug = null;
  var returnFocusEl = null;
  var HASH_PREFIX = "#project/";

  function pinsHTML(stages) {
    return stages.map(function (s, i) {
      return '<span class="wf-pin' + (s.kind ? " wf-pin--" + s.kind : "") + '" data-stage="' + (i + 1) + '" style="left:' + s.x + "%;top:" + s.y + '%">' + (i + 1) + "</span>";
    }).join("");
  }

  function shotButton(m, opts) {
    // A screenshot that opens the lightbox. opts.pins: workflow stages to overlay.
    var full = m.full || m.src;
    return '<button type="button" class="shot shot-btn" data-lightbox="' + full + '" data-lw="' + (m.fw || m.w) + '" data-lh="' + (m.fh || m.h) + '"' +
      ' data-caption="' + esc(m.caption) + '"' + (opts && opts.pins ? ' data-pins="' + opts.slug + '"' : "") + ' aria-label="Enlarge: ' + esc(m.alt) + '">' +
      '<span class="shot-frame"><img src="' + m.src + '" width="' + m.w + '" height="' + m.h + '" alt="' + esc(m.alt) + '" loading="lazy" decoding="async">' +
      (opts && opts.pins ? pinsHTML(opts.pins) : "") + "</span>" +
      '<span class="shot-hint mono" aria-hidden="true">Click to enlarge ↗</span></button>';
  }

  function renderWorkflow(p) {
    var wf = p.workflow;
    return '<section class="cs-block cs-wide cs-workflow">' +
      '<h3 class="mono">How it works · the real workflow</h3>' +
      '<p class="cs-flow-note">This is the actual ' + esc(wf.platform || "n8n") + ' workflow, not a reconstruction. The numbers mark the stages explained below.</p>' +
      '<figure class="wf-figure">' + shotButton(wf, { pins: wf.stages, slug: p.slug }) + '<figcaption>' + esc(wf.caption) + "</figcaption></figure>" +
      '<ol class="wf-stages">' + wf.stages.map(function (s, i) {
        return '<li class="wf-stage' + (s.kind ? " wf-stage--" + s.kind : "") + '" data-stage="' + (i + 1) + '">' +
          '<span class="wf-num" aria-hidden="true">' + (i + 1) + "</span>" +
          '<div><b>' + esc(s.title) + '</b><code>' + esc(s.nodes) + "</code>" + (s.note ? "<p>" + esc(s.note) + "</p>" : "") + "</div></li>";
      }).join("") + "</ol></section>";
  }

  function renderFlow(p) {
    return '<section class="cs-block"><h3 class="mono">How it works · ' + esc((p.flowLabel || "Conceptual flow").toLowerCase()) + "</h3>" +
      (p.flowNote ? '<p class="cs-flow-note">' + esc(p.flowNote) + "</p>" : "") +
      '<ol class="flow">' + p.flow.map(function (s, i) {
        return '<li class="flow-step' + (s.branch ? " is-branch" : "") + '" data-kind="' + s.kind + '" style="--i:' + i + '">' +
          '<span class="flow-marker" aria-hidden="true"></span>' +
          '<span class="flow-label">' + esc(s.label) + "</span>" +
          '<span class="flow-title">' + esc(s.title) + (s.note ? '<span class="flow-note">' + esc(s.note) + "</span>" : "") + "</span>" +
          "</li>";
      }).join("") + "</ol>" +
      '<p class="flow-legend" aria-hidden="true"><span><i></i>step</span><span class="l-rule"><i></i>rule / code</span><span class="l-ai"><i></i>AI</span><span class="l-human"><i></i>person / exception</span></p>' +
      "</section>";
  }

  function render(p) {
    var idx = PROJECTS.indexOf(p);
    var prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    var next = PROJECTS[(idx + 1) % PROJECTS.length];

    var links = "";
    if (p.repo) links += '<a class="btn btn-primary" href="' + p.repo + '" target="_blank" rel="noopener">View repository <span aria-hidden="true">↗</span></a>';
    if (p.demo) links += '<a class="btn btn-ghost" href="' + p.demo + '" target="_blank" rel="noopener">View live demo <span aria-hidden="true">↗</span></a>';
    (p.extraLinks || []).forEach(function (l) {
      links += '<a class="text-link" href="' + l.url + '" target="_blank" rel="noopener">' + esc(l.label) + " ↗</a>";
    });

    var related = "";
    var rels = [].concat(p.related || []).filter(function (x) { return bySlug[x.slug]; });
    if (rels.length) {
      related = '<aside class="cs-related" aria-label="Related systems">' +
        '<p class="mono">' + (rels.length > 1 ? "Related systems" : "Related system") + "</p>" +
        rels.map(function (x) {
          return '<div class="cs-related-item"><p>' + esc(x.text) + "</p>" +
            '<button type="button" class="cs-related-link" data-goto="' + x.slug + '">Open ' + esc(bySlug[x.slug].title) + ' <span aria-hidden="true">→</span></button></div>';
        }).join("") + "</aside>";
    }

    var evidence = "";
    if (p.evidence) {
      evidence = '<section class="cs-block cs-wide"><h3 class="mono">Production evidence</h3>' +
        '<dl class="cs-evidence">' + p.evidence.items.map(function (e) {
          return "<div><dt>" + esc(e.value) + "</dt><dd>" + esc(e.label) + "</dd></div>";
        }).join("") + "</dl>" +
        '<p class="cs-flow-note cs-evidence-note">' + esc(p.evidence.note) + "</p></section>";
    }

    var media = "";
    if (p.media && p.media.length) {
      media = '<section class="cs-block cs-wide"><h3 class="mono">From the project</h3><div class="cs-media' + (p.media.length > 1 ? " has-two" : "") + '">' +
        p.media.map(function (m) { return "<figure>" + shotButton(m) + "<figcaption>" + esc(m.caption) + "</figcaption></figure>"; }).join("") +
        "</div></section>";
    }

    var sample = p.sample
      ? '<figure class="cs-sample"><figcaption class="mono">' + esc(p.sample.label) + "</figcaption><pre><code>" + esc(p.sample.code) + "</code></pre></figure>"
      : "";

    var builtAndStack =
      '<section class="cs-block"><h3 class="mono">What I built</h3><ul>' + p.built.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul></section>" +
      '<section class="cs-block"><h3 class="mono">Stack</h3><ul class="cs-stack">' + p.stack.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></section>";

    // Real implementation leads the case study; a conceptual flow sits beside "What I built"
    var lead = p.workflow ? renderWorkflow(p) : media;
    if (!p.workflow) media = "";
    var how = p.workflow
      ? builtAndStack
      : renderFlow(p) + '<div class="cs-side">' + builtAndStack.replace('<section class="cs-block"><h3 class="mono">Stack', '<section class="cs-block cs-gap"><h3 class="mono">Stack') + "</div>";

    body.innerHTML =
      '<header class="cs-head">' +
        '<h2 class="cs-title" id="caseTitle" tabindex="-1">' + esc(p.title) + "</h2>" +
        '<p class="cs-tagline">' + esc(p.tagline) + "</p>" +
        '<div class="cs-facts"><span class="cs-status"><span class="visually-hidden">Status: </span>' + esc(p.status) + "</span>" +
        (links ? '<div class="cs-links">' + links + "</div>" : "") + "</div>" +
      "</header>" +
      related +
      '<div class="cs-grid">' +
        lead +
        '<section class="cs-block"><h3 class="mono">The problem</h3><p>' + esc(p.problem) + "</p></section>" +
        '<section class="cs-block"><h3 class="mono">The system</h3><p>' + esc(p.system) + "</p></section>" +
        how +
        evidence +
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
    var card = document.querySelector('.project [data-open="' + currentSlug + '"]');
    if (card && (!target || target.getAttribute("data-open") !== currentSlug)) target = card;
    if (target && document.contains(target)) {
      target.focus({ preventScroll: target === returnFocusEl });
      if (target !== returnFocusEl) target.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
    currentSlug = null;
    returnFocusEl = null;
  }

  function animateClose() {
    if (lightbox.open) closeLightbox();
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    if (reduceMotion.matches) { finishClose(); return; }
    dialog.classList.add("is-closing");
    setTimeout(finishClose, 230);
  }

  function requestClose() {
    if (history.state && history.state.project) {
      history.back(); // popstate closes
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      animateClose();
    }
  }

  window.addEventListener("popstate", function () {
    var slug = location.hash.indexOf(HASH_PREFIX) === 0 ? location.hash.slice(HASH_PREFIX.length) : null;
    if (slug && bySlug[slug]) openProject(slug, { history: "none" });
    else if (dialog.open) animateClose();
  });

  /* ---------- Lightbox ---------- */
  function setZoom(on) {
    lightbox.classList.toggle("is-zoomed", on);
    lbZoom.setAttribute("aria-pressed", String(on));
    lbZoom.textContent = on ? "Fit to screen" : "Actual size";
  }

  function openLightbox(btn) {
    lbReturn = btn;
    var src = btn.getAttribute("data-lightbox");
    var w = btn.getAttribute("data-lw"), h = btn.getAttribute("data-lh");
    var img = btn.querySelector("img");
    var pinsFor = btn.getAttribute("data-pins");
    var pins = pinsFor && bySlug[pinsFor] && bySlug[pinsFor].workflow ? pinsHTML(bySlug[pinsFor].workflow.stages) : "";
    lbStage.innerHTML = '<div class="lb-frame" style="--lw:' + w + 'px"><img src="' + src + '" width="' + w + '" height="' + h + '" alt="' + esc(img.alt) + '">' + pins + "</div>";
    lbCaption.textContent = btn.getAttribute("data-caption") || "";
    // Wide/tall images are unreadable when fitted on small screens: start at actual size there
    setZoom(window.innerWidth < 900 && +w > window.innerWidth);
    lightbox.showModal();
    lbStage.scrollTop = 0;
    lbStage.scrollLeft = 0;
    document.getElementById("lbClose").focus();
  }

  function closeLightbox() {
    if (!lightbox.open) return;
    lightbox.close();
    lbStage.innerHTML = "";
    if (lbReturn && document.contains(lbReturn)) lbReturn.focus({ preventScroll: true });
    lbReturn = null;
  }

  lbZoom.addEventListener("click", function () { setZoom(!lightbox.classList.contains("is-zoomed")); });
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("cancel", function (e) { e.preventDefault(); closeLightbox(); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });

  /* ---------- Global click handling ---------- */
  document.addEventListener("click", function (e) {
    var shot = e.target.closest("[data-lightbox]");
    if (shot) { openLightbox(shot); return; }
    var opener = e.target.closest("[data-open]");
    if (opener) {
      e.preventDefault();
      openProject(opener.getAttribute("data-open"), { history: dialog.open ? "replace" : "push", trigger: opener });
      return;
    }
    var goto = e.target.closest("[data-goto]");
    if (goto) openProject(goto.getAttribute("data-goto"), { history: "replace" });
  });

  // Hovering a stage highlights its marker on the workflow screenshot (and vice versa)
  function hot(e, on) {
    var el = e.target.closest && e.target.closest("[data-stage]");
    if (!el || !body.contains(el)) return;
    var n = el.getAttribute("data-stage");
    body.querySelectorAll('[data-stage="' + n + '"]').forEach(function (x) { x.classList.toggle("is-hot", on); });
  }
  body.addEventListener("mouseover", function (e) { hot(e, true); });
  body.addEventListener("mouseout", function (e) { hot(e, false); });

  closeBtn.addEventListener("click", requestClose);
  dialog.addEventListener("cancel", function (e) { e.preventDefault(); requestClose(); });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) requestClose(); });

  // Deep link: any page + #project/<slug>
  if (location.hash.indexOf(HASH_PREFIX) === 0) {
    var initial = location.hash.slice(HASH_PREFIX.length);
    if (bySlug[initial]) openProject(initial, { history: "none" });
  }
})();
