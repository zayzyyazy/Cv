/*
  Project card templates. Pages place <div data-card="slug"></div> slots;
  main.js swaps each slot for the card below and fills text from PROJECTS.
  One template per project, shared by the Home preview and the Projects page.
*/
window.CARD_TEMPLATES = {
  inbound: function () {
    return '' +
    '<article class="project project--voice reveal" data-project="inbound">' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono">Inbound</span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<p class="project-focus mono" data-field="focus"></p>' +
      '</div>' +
      '<div class="project-visual vis-voice" aria-hidden="true">' +
        '<div class="vv-row"><span class="vv-k mono">intent</span><span class="vv-chips"><i>status</i><i>address change</i><i>cancellation</i><i>transfer</i></span></div>' +
        '<div class="vv-row"><span class="vv-k mono">verify</span><span class="vv-chips"><i>phone + birthday</i><i>postal code</i><i>insurance no.</i></span></div>' +
        '<div class="vv-row vv-gate"><span class="vv-k mono">action</span><span class="vv-v">only with <b>function evidence</b></span></div>' +
        '<div class="vv-row vv-flag"><span class="vv-k mono">qa</span><span class="vv-v"><code>promised_without_evidence</code></span></div>' +
      '</div>' +
      '<button class="project-open" type="button" data-open="inbound">Read the case study <span aria-hidden="true">→</span></button>' +
    '</article>';
  },

  scheduler: function () {
    return '' +
    '<article class="project project--voice reveal" data-project="scheduler">' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono">Outbound</span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<p class="project-focus mono" data-field="focus"></p>' +
      '</div>' +
      '<div class="project-visual vis-voice vis-sched" aria-hidden="true">' +
        '<div class="vs-line"><span class="vs-who mono">caller</span><q>“Yes, Tuesday works.”</q></div>' +
        '<div class="vs-line"><span class="vs-who mono">tool</span><code>create_appointment(name, phone, reason, …)</code></div>' +
        '<div class="vs-split">' +
          '<div class="vs-out vs-ok"><code>appointment_created</code><span>→ confirm</span></div>' +
          '<div class="vs-out vs-no"><code>tool failed</code><span>→ don’t confirm</span></div>' +
        '</div>' +
      '</div>' +
      '<button class="project-open" type="button" data-open="scheduler">Read the case study <span aria-hidden="true">→</span></button>' +
    '</article>';
  },
  waybill: function () {
    return '' +
    '<article class="project project--feature reveal" data-project="waybill">' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono" data-field="category"></span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<p class="project-note">Deterministic rules, data reconciliation and explicit exceptions. <strong>No AI needed.</strong></p>' +
        '<button class="project-open" type="button" data-open="waybill">Read the case study <span aria-hidden="true">→</span></button>' +
      '</div>' +
      '<div class="project-visual vis-waybill" aria-hidden="true">' +
        '<div class="wb-sources">' +
          '<div class="wb-src"><span class="mono">Shopify</span><b>#1043 · fulfilled</b></div>' +
          '<div class="wb-src"><span class="mono">Carrier API</span><b>delivered · no POD</b></div>' +
          '<div class="wb-src"><span class="mono">Drive</span><b>0 documents found</b></div>' +
        '</div>' +
        '<div class="wb-pipe"><span class="wb-step">normalize</span><span class="wb-step">reconcile</span><span class="wb-step">rules</span></div>' +
        '<div class="wb-states">' +
          '<div class="wb-state ok"><span class="wb-dot"></span><b>HEALTHY</b><span class="mono">POD found</span></div>' +
          '<div class="wb-state watch"><span class="wb-dot"></span><b>WATCH</b><span class="mono">RETRY_CARRIER</span></div>' +
          '<div class="wb-state exc is-hit"><span class="wb-dot"></span><b>EXCEPTION</b><span class="mono">POD_DOCUMENT_MISSING</span></div>' +
        '</div>' +
      '</div>' +
    '</article>';
  },

  paperguard: function () {
    return '' +
    '<article class="project project--paper reveal" data-project="paperguard">' +
      '<div class="project-visual vis-paper" aria-hidden="true">' +
        '<div class="sheet">' +
          '<p class="sheet-file mono">thesis_final_v3.docx</p>' +
          '<div class="sheet-line w90"></div>' +
          '<div class="sheet-line w70 mark-fail"><span class="stamp fail">FAIL</span><span class="anno">Arial ≠ Times</span></div>' +
          '<div class="sheet-line w85"></div>' +
          '<div class="sheet-line w60 mark-fail"><span class="stamp fail">FAIL</span><span class="anno">63 words, need 150+</span></div>' +
          '<div class="sheet-line w80"></div>' +
          '<div class="sheet-line w75 mark-pass"><span class="stamp pass">PASS</span><span class="anno">margins 2.5 cm</span></div>' +
          '<div class="sheet-figure"><span class="stamp review">REVIEW</span><span class="anno">figure source unclear → person</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono" data-field="category"></span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<button class="project-open" type="button" data-open="paperguard">Read the case study <span aria-hidden="true">→</span></button>' +
      '</div>' +
    '</article>';
  },

  northstar: function () {
    return '' +
    '<article class="project project--north reveal" data-project="northstar">' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono" data-field="category"></span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<button class="project-open" type="button" data-open="northstar">Read the case study <span aria-hidden="true">→</span></button>' +
      '</div>' +
      '<div class="project-visual vis-north" aria-hidden="true">' +
        '<ol class="gates">' +
          '<li class="gate rule"><span class="mono">rules</span><b>high value + major damage</b></li>' +
          '<li class="gate ai"><span class="mono">ai</span><b>recommends <s>SCRAP</s></b></li>' +
          '<li class="gate rule"><span class="mono">guardrail</span><b>hard rule overrides</b></li>' +
          '<li class="gate human"><span class="mono">human</span><b>MANUAL_REVIEW</b></li>' +
        '</ol>' +
      '</div>' +
    '</article>';
  },

  "call-qa": function () {
    var bars = "";
    for (var i = 0; i < 64; i++) {
      var h = 18 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.19)) * 72 + ((i * 37) % 11);
      bars += '<i style="height:' + Math.min(100, h).toFixed(0) + '%"></i>';
    }
    return '' +
    '<article class="project project--dark project--qa" data-project="call-qa">' +
      '<div class="project-visual vis-qa" aria-hidden="true">' +
        '<div class="wave">' + bars + '</div>' +
        '<div class="pins">' +
          '<span class="pin" style="--x:18%"><i class="mono">00:42</i><span>intent: cancel</span></span>' +
          '<span class="pin pin--flag" style="--x:52%"><i class="mono">01:28</i><span>caller cut off</span></span>' +
          '<span class="pin" style="--x:80%"><i class="mono">02:51</i><span>result: partial</span></span>' +
        '</div>' +
        '<p class="qa-draft mono">AI draft → <span>reviewer edits</span></p>' +
      '</div>' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono" data-field="category"></span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<p class="project-role mono">Reviews many calls → finds recurring issues</p>' +
        '<button class="project-open" type="button" data-open="call-qa">Read the case study <span aria-hidden="true">→</span></button>' +
      '</div>' +
    '</article>';
  },

  "incident-room": function () {
    return '' +
    '<article class="project project--dark project--incident" data-project="incident-room">' +
      '<div class="project-visual vis-incident" aria-hidden="true">' +
        '<div class="trace">' +
          '<div class="trace-row"><span class="mono">L1 conversation</span><b>“order placed ✓”</b></div>' +
          '<div class="trace-row"><span class="mono">L2 execution</span><b>sideEffectCreated: false</b></div>' +
          '<div class="trace-verdict"><span class="mono">mismatch</span><b>noop_side_effect</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono" data-field="category"></span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<p class="project-role mono">Investigates one failure → finds the cause</p>' +
        '<button class="project-open" type="button" data-open="incident-room">Read the case study <span aria-hidden="true">→</span></button>' +
      '</div>' +
    '</article>';
  },

  explainer: function () {
    return '' +
    '<article class="project project--explainer reveal" data-project="explainer">' +
      '<div class="project-text">' +
        '<p class="project-meta"><span class="project-num" data-field="number"></span><span class="mono" data-field="category"></span></p>' +
        '<h3 class="project-title" data-field="title"></h3>' +
        '<p class="project-tagline" data-field="tagline"></p>' +
        '<button class="project-open" type="button" data-open="explainer">Read the case study <span aria-hidden="true">→</span></button>' +
      '</div>' +
      '<div class="project-visual vis-explainer" aria-hidden="true">' +
        '<ul class="ex-tree mono">' +
          '<li class="ex-dir ex-root">webhook-worker/</li>' +
          '<li>README.md</li>' +
          '<li>.env.example</li>' +
          '<li>package.json</li>' +
          '<li class="ex-dir">src/</li>' +
          '<li style="--d:2">handlers/</li>' +
          '<li style="--d:2">server.js</li>' +
        '</ul>' +
        '<span class="ex-arrow">→</span>' +
        '<div class="ex-report">' +
          '<div class="ex-card"><span class="mono">What it is</span><b>Webhook ingest service</b></div>' +
          '<div class="ex-card"><span class="mono">Run &amp; deploy</span><b>3 env vars · no tests</b></div>' +
          '<div class="ex-card ex-card--warn"><span class="mono">README vs reality</span><b>retries undocumented</b></div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }
};
