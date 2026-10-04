/*
  Project data — single source of truth for cards + case-study overlays.
  Every claim here is sourced from the project's own README / repository.
  Do not add metrics, clients or production claims that the repos don't support.

  flow[].kind controls the marker colour in the overlay:
    input | step | rule | ai | human | output | exception
  flow[].branch = true renders the step as a side branch.
*/
window.PROJECTS = [
  {
    slug: "waybill",
    number: "01",
    title: "Waybill",
    category: "Shipment reconciliation",
    tagline: "Three systems disagree about an order. Waybill works out which orders need a person, and why.",
    status: "Portfolio system · synthetic data",
    problem:
      "Checking an order by hand means looking it up in Shopify, in the carrier's tracking and in a folder of delivery documents, then deciding which source to trust when they disagree. It's slow, repetitive, and the judgment calls end up in someone's head.",
    system:
      "An n8n workflow that pulls fulfilments from Shopify, matches carrier tracking by tracking number, searches Google Drive for proof of delivery or customs documents when the rules require it, and rolls everything up into one status per order: HEALTHY, WATCH or EXCEPTION, with issue codes and a recommended action.",
    flow: [
      { kind: "input", label: "Input", title: "Shopify order + fulfilments", note: "Admin GraphQL, client-credentials token" },
      { kind: "input", label: "Fetch", title: "Carrier tracking", note: "REST API, retries enabled" },
      { kind: "exception", label: "Branch", title: "Carrier call fails → WATCH + RETRY_CARRIER", note: "a visible state instead of a silent gap", branch: true },
      { kind: "step", label: "Normalize", title: "Match by tracking number", note: "not by array position" },
      { kind: "rule", label: "Rules", title: "Anomalies, failed attempts, stalled > 3 days", note: "explicit JavaScript, no AI" },
      { kind: "step", label: "Documents", title: "Drive lookup when POD or customs evidence is needed" },
      { kind: "rule", label: "Roll up", title: "Highest shipment severity sets the order state" },
      { kind: "output", label: "Output", title: "HEALTHY / WATCH / EXCEPTION", note: "issue codes + recommended actions" }
    ],
    built: [
      "The complete n8n workflow: Shopify token exchange and GraphQL query, carrier response normalization, Drive document check and order roll-up.",
      "The rule set in JavaScript, with traceable issue codes such as POD_DOCUMENT_MISSING and actions such as CREATE_SUPPORT_TASK.",
      "A separate failure branch for carrier API errors, plus smoke tests that run the exported rule code against synthetic cases."
    ],
    interesting:
      "It deliberately uses no AI. These are questions with right answers, so they're handled by rules you can read. Every status carries the reasons that caused it, and the repository documents where the workflow still falls short, e.g. Shopify and Drive failures don't yet have an equivalent recovery path.",
    sample: {
      label: "Generated output for a synthetic order",
      code: '{\n  "status": "EXCEPTION",\n  "issues": ["POD_DOCUMENT_MISSING"],\n  "recommended_actions": ["CREATE_SUPPORT_TASK"],\n  "requires_attention": true\n}'
    },
    media: [
      { src: "assets/img/waybill-n8n.webp", w: 1600, h: 554, alt: "The Waybill n8n workflow canvas: Shopify and carrier requests, shipment evaluation, Drive document search and a separate carrier-error branch rejoining before the order roll-up.", caption: "The real n8n canvas. The lower path is the carrier-error branch. Private endpoint labels are redacted." }
    ],
    stack: ["n8n", "Shopify Admin GraphQL", "REST APIs", "Google Drive", "JavaScript rules"],
    repo: "https://github.com/zayzyyazy/n8n-waybill-reconciliation",
    demo: null
  },
  {
    slug: "paperguard",
    number: "02",
    title: "PaperGuard",
    category: "Document validation",
    tagline: "Checks a document against a specification and says exactly what's wrong, and what it isn't sure about.",
    status: "Portfolio system · template-sensitive parser",
    problem:
      "Checking a document against a formatting specification means dozens of small comparisons: fonts, margins, spacing, section order, abstract length, citations. They're tedious, easy to miss, and every reviewer does them a little differently.",
    system:
      "An n8n workflow that takes an uploaded .docx, reads its underlying OOXML structure, checks it against an explicit pack of 18 policies, and returns PASS, FAIL or REVIEW_REQUIRED for each one, with the expected value next to what was actually found.",
    flow: [
      { kind: "input", label: "Input", title: "DOCX upload", note: "n8n form" },
      { kind: "step", label: "Extract", title: "Unzip OOXML, parse document + styles" },
      { kind: "step", label: "Normalize", title: "Paragraphs, runs, spacing, margins, headings" },
      { kind: "rule", label: "Policy pack", title: "18 explicit checks", note: "structure, typography, citations, figures" },
      { kind: "human", label: "Review", title: "Unclear figure sources / quotations → REVIEW_REQUIRED", branch: true },
      { kind: "output", label: "Output", title: "Structured report", note: "expected vs. detected, per policy" }
    ],
    built: [
      "The extraction step that treats a DOCX as a ZIP archive and normalizes its XML into something checkable.",
      "The policy pack and validators: section labels, abstract bounds, fonts, spacing, margins, author/year citation matching, heading hierarchy.",
      "Report aggregation into PASS / FAIL / REVIEW_REQUIRED / NOT_CHECKED, and smoke tests for missing-reference and review cases."
    ],
    interesting:
      "No LLM, on purpose. Margins and fonts have right answers and code checks them the same way every time. A model would only add cost and variability. Where the answer is genuinely unclear, the report says so and hands it to a person instead of guessing.",
    sample: {
      label: "One test document",
      code: "RESULT: 7/18 requirements passed\n\n• Abstract word count\n  expected 150–300 · detected 63\n• Body font family\n  expected Times New Roman · detected Arial"
    },
    media: [
      { src: "assets/img/paperguard-n8n.webp", w: 1600, h: 634, alt: "The PaperGuard n8n workflow canvas showing extraction, validation and report stages.", caption: "The full n8n workflow: extraction, validation, report." },
      { src: "assets/img/paperguard-report.webp", w: 892, h: 1088, alt: "PaperGuard result for a test document: 7 of 18 requirements passed, listing issues with expected and detected values.", caption: "Result for one test document. Not an accuracy metric." }
    ],
    stack: ["n8n", "JavaScript", "DOCX / OOXML", "Structured JSON reports"],
    repo: "https://github.com/zayzyyazy/n8n-paperguard-document-validator",
    demo: null
  },
  {
    slug: "northstar",
    number: "03",
    title: "NorthStar",
    category: "AI-assisted decisions",
    tagline: "Rules first, AI within limits, and a person makes the final call.",
    status: "Portfolio system · synthetic data",
    problem:
      "Deciding what to do with a returned item mixes fixed restrictions with judgment. An unconstrained AI recommendation can ignore rules that must never be broken; a fully manual process repeats the same lookups and calculations for every return.",
    system:
      "An n8n workflow where hard rules run first, a local model recommends an action within those limits, guardrails resolve the result, and an employee accepts or overrides it. Repeated corrections can become new policies, but only after a manager approves them.",
    flow: [
      { kind: "input", label: "Input", title: "Return inspection form" },
      { kind: "rule", label: "Rules", title: "Recovery economics, supplier window, hard restrictions" },
      { kind: "ai", label: "AI", title: "Recommend RESTOCK / REFURBISH / RETURN / SCRAP", note: "Ollama-compatible endpoint, structured JSON" },
      { kind: "exception", label: "Fallback", title: "Malformed JSON or unknown action → MANUAL_REVIEW", branch: true },
      { kind: "rule", label: "Guardrails", title: "Hard rules override the model" },
      { kind: "human", label: "Human", title: "Employee accepts or overrides", note: "decision + reason saved" },
      { kind: "human", label: "Learning", title: "≥ 3 matching corrections → PENDING policy → manager approves" }
    ],
    built: [
      "The decision workflow: catalog lookup, recovery-vs-scrap calculation, deterministic rules and policy matching.",
      "The AI step with constrained context and an allowed-action list, plus fallbacks for malformed model output.",
      "The human loop: employee review and override history, correction-pattern analysis and a separate manager approval branch."
    ],
    interesting:
      "The model never acts on its own output. Learning from corrections is plain deterministic JavaScript, not model training, and a proposed policy stays PENDING until a manager approves it.",
    sample: {
      label: "AI said SCRAP for a high-value, damaged item",
      code: '{\n  "action": "MANUAL_REVIEW",\n  "source": "HARD_RULE",\n  "reason": "Company policy requires human approval for this case."\n}'
    },
    media: [
      { src: "assets/img/northstar-n8n.webp", w: 1500, h: 919, alt: "The NorthStar n8n workflow canvas: the decision path on the right, correction analysis and manager approval on the left.", caption: "The real canvas. Right: the decision path. Left: correction analysis and manager approval." },
      { src: "assets/img/northstar-review-loop.webp", w: 696, h: 567, alt: "Close-up of the NorthStar candidate generation and manager approval branches.", caption: "Repeated corrections create pending candidates; a separate approval path activates them." }
    ],
    stack: ["n8n", "JavaScript rules", "Ollama", "n8n Data Tables", "Human review forms"],
    repo: "https://github.com/zayzyyazy/n8n-northstar-human-review",
    demo: null
  },
  {
    slug: "call-qa",
    number: "04",
    title: "AI Call QA Cockpit",
    category: "Call review tool",
    tagline: "A desktop workspace for reviewing support calls, where AI drafts the analysis and a reviewer owns it.",
    status: "Desktop app · later evolved into a domain-specific version",
    problem:
      "Improving a voice or support agent means listening to calls, writing down what went wrong, and noticing when the same problem keeps coming back. Usually that lives in scattered notes, and patterns across calls get lost.",
    system:
      "A desktop app that imports call recordings, transcribes them, drafts an analysis (caller intent, call result, main issue, likely root cause), and lets a reviewer correct it, pin evidence to moments in the call, and link issues across calls. Experiments track which prompt or workflow change was tried for which issue.",
    flow: [
      { kind: "input", label: "Input", title: "Call recording", note: "imported into app storage" },
      { kind: "ai", label: "Transcribe", title: "Speech-to-text" },
      { kind: "ai", label: "Draft", title: "Intent, result, issue, root cause", note: "a draft, not a verdict" },
      { kind: "human", label: "Review", title: "Reviewer edits analysis, pins evidence moments" },
      { kind: "step", label: "Patterns", title: "Issues linked across calls" },
      { kind: "output", label: "Output", title: "Experiments + meeting-ready summaries" }
    ],
    built: [
      "The app itself: Tauri 2 shell, React/TypeScript interface and Rust side.",
      "The call ingest and draft pipeline, the call-review prompt and the editable AI analysis.",
      "The issue, evidence and experiment model that ties findings back to specific calls."
    ],
    interesting:
      "The AI output is treated as a starting point a reviewer corrects, not as the answer. The value is in the evidence trail: which moment in which call shows the problem, and what was changed because of it. It later became the base for a more domain-specific version.",
    sample: null,
    media: [],
    stack: ["Tauri 2", "React", "TypeScript", "Rust", "OpenAI API"],
    repo: "https://github.com/zayzyyazy/ai-call-qa-cockpit",
    demo: null
  },
  {
    slug: "incident-room",
    number: "05",
    title: "Incident Room",
    category: "AI incident investigation",
    tagline: "The customer was told it worked. Did it actually work?",
    status: "Team hackathon project · deployed demo",
    problem:
      "AI support and voice agents can confidently tell a customer “your order is placed” while the tool call behind it did nothing. The conversation looks successful; the backend shows a no-op. Nobody notices until the customer does.",
    system:
      "An investigation desk that captures a failed interaction as structured evidence in three layers (the conversation, the tool calls and side effects, and the customer context), then runs investigation agents that look at those layers separately before a judge compares them and writes a report.",
    flow: [
      { kind: "input", label: "Input", title: "Failed chat or imported call" },
      { kind: "step", label: "Normalize", title: "Three-layer evidence", note: "conversation · execution · customer" },
      { kind: "ai", label: "Split", title: "Conversation agents see what the customer heard" },
      { kind: "ai", label: "Split", title: "Execution agents see tool traces + side effects" },
      { kind: "exception", label: "Compare", title: "Claim vs. what actually happened", note: "e.g. noop_side_effect" },
      { kind: "human", label: "Output", title: "Cause finding + PDF report for a person" }
    ],
    built: [
      "Built with a teammate for the Band of Agents Hackathon. I started the project and worked mainly on the investigation side.",
      "The three-layer evidence model and the contradiction analysis between what was said and what the tools did.",
      "The multi-room investigation flow, the incident and evidence views, and the audit report output."
    ],
    interesting:
      "Evidence is split before anyone interprets it: agents reading the transcript don't see the tool trace, and vice versa. That keeps the conversation from talking the investigation into believing it worked.",
    sample: {
      label: "Customer heard success; tool trace says otherwise",
      code: 'Assistant: "Great news, I\'ve placed your order."\n\n{\n  "orderPlaced": false,\n  "sideEffectCreated": false,\n  "failureClass": "noop_side_effect"\n}'
    },
    media: [],
    stack: ["Next.js", "TypeScript", "MongoDB", "LangGraph", "Band agents", "pdf-lib"],
    repo: "https://github.com/zayzyyazy/Incident-Room",
    demo: "https://incident-room.vercel.app"
  },
  {
    slug: "knowledge",
    number: "06",
    title: "Local AI Knowledge System",
    category: "Personal infrastructure",
    tagline: "Capture things once, find them again later, all running on my own machine.",
    status: "Personal system · no public repository",
    problem:
      "Useful information ends up spread across notes, folders and documents. Finding the right piece later usually means remembering where you put it.",
    system:
      "A local-first pipeline: things I capture are structured by n8n workflows, stored, embedded and indexed in a vector database, so a local model can retrieve the relevant pieces when I ask.",
    flow: [
      { kind: "input", label: "Capture", title: "Webhook / Drive" },
      { kind: "step", label: "Orchestrate", title: "n8n workflow" },
      { kind: "step", label: "Structure", title: "Structured record → Drive" },
      { kind: "ai", label: "Embed", title: "Embeddings" },
      { kind: "step", label: "Index", title: "Qdrant vector search" },
      { kind: "output", label: "Retrieve", title: "Local model via Ollama" }
    ],
    built: [
      "The ingestion workflows in n8n.",
      "The local stack they run on: Docker, Ollama and Qdrant."
    ],
    interesting:
      "It's infrastructure rather than a product: the point was to understand every moving part of a retrieval system by running it locally, end to end.",
    sample: null,
    media: [],
    stack: ["Docker", "n8n", "Ollama", "Qdrant", "Google Drive"],
    repo: null,
    demo: null
  }
];
