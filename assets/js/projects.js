/*
  Project data: single source of truth for cards + case-study overlays.
  Every claim here is sourced from the project's own README / repository.
  Do not add metrics, clients or production claims that the repos don't support.

  How-it-works has two honest modes:
    workflow  → the REAL implementation (n8n canvas screenshot) with numbered stages.
                Each stage names actual nodes; x/y (%) place its marker on the screenshot.
    flow      → a simplified diagram, always shown under `flowLabel`
                ("Conceptual flow" / "System overview"), never as the implementation.

  flow[].kind controls the marker: input | step | rule | ai | human | output | exception
  hidden: true keeps a project's data but removes it from the public collection.
*/
window.PROJECTS = [
  {
    slug: "inbound",
    family: "voice",
    number: "01",
    title: "Inbound Voice Operations",
    category: "Voice agents · Leaping",
    tagline: "An inbound voice agent moved from prompt-controlled behaviour to a system that can be verified, tested and trusted.",
    focus: "Routing · verification · tools · recovery · QA",
    status: "Production work · sanitized public case study",
    related: [
      { slug: "scheduler", text: "Same production work, different problem: the Appointment Scheduler is an outbound flow that turns a spoken “yes” into a real calendar booking." },
      { slug: "call-qa", text: "The call-review screenshots below come from the QA tool that grew out of the AI Call QA Cockpit." }
    ],
    problem:
      "A voice agent handling inbound operational calls can sound helpful while doing the wrong thing: skipping verification, calling functions in the wrong order, promising a ticket that was never created, or answering a delivery question from guesswork. Tuning the prompt one bad call at a time doesn't fix that.",
    system:
      "A Leaping workflow where the agent handles the conversation but sensitive steps run through state, functions and deterministic exits: intent routing, customer lookup, verification (phone + birthday, postal/address, or an insurance-number fallback), then function-backed status, update, ticket and transfer actions. Around it, a QA process that checks what the agent said against what the functions actually did.",
    workflow: {
      src: "/assets/img/va-inbound-leaping.webp", w: 1600, h: 1370,
      full: "/assets/img/va-inbound-leaping.webp", fw: 1600, fh: 1370,
      alt: "The real inbound Leaping Studio workflow, redacted: helper functions, customer lookup, open-case check, intent classification dialogue, intent field setters and verification method routing, with numbered markers.",
      caption: "The real Leaping Studio canvas, cropped and redacted. Prompt text and identifying wording are removed.",
      platform: "Leaping",
      stages: [
        { x: 1.4, y: 15.0, title: "Helpers", nodes: "Function: get_now · Function: clean_phone_number", note: "Current time, and the caller's number cleaned before any lookup." },
        { x: 29.4, y: 8.2, title: "Customer lookup", nodes: "Function: get_… (name redacted)", note: "Phone-based lookup can prefill candidate customer context." },
        { x: 1.4, y: 51.5, title: "Open-case check", nodes: "Function: check_open", note: "Is there already an open case for this caller?" },
        { x: 27.5, y: 26.4, title: "Branch on open case", nodes: "Junction: field(is_open) == true", note: "A deterministic branch, not a prompt instruction." },
        { x: 50.6, y: 27.4, title: "Intent classification", nodes: "Dialogue: Intentermittlung", note: "Routes to product change, delivery status, cancellation, address change, reactivation, new-customer order, transfer or other.", kind: "ai" },
        { x: 80.8, y: 28.6, title: "Normalize the intent", nodes: "Field Setter: intent = …", note: "Each route writes one normalized intent field for the stages that follow.", kind: "rule" },
        { x: 49.1, y: 78.8, title: "New-customer route", nodes: "Field Setter: intent = neukunden_bestellung", note: "New customers go to a callback handoff instead of a protected action." },
        { x: 97.3, y: 86.6, title: "Verification routing", nodes: "vnr · plz · nicht … · Call T… (partly visible)", note: "Insurance number, postal code, not identifiable, or transfer: protected actions wait for verification.", kind: "rule" }
      ]
    },
    built: [
      "Designed and debugged intent routing for operational support calls, and redesigned verification around phone, address/postal and identifier fallback paths.",
      "Investigated authentication bypass, wrong function order, verification loops, missing and duplicate tickets, transfer misses and false success claims.",
      "Helped move delivery/status logic from LLM reasoning into backend-driven fields and deterministic date cases, and helped introduce deterministic MCP/backend components for sensitive decisions.",
      "Audited large production call cohorts instead of single bad calls, and turned recurring failures into QA categories and regression cases."
    ],
    interesting:
      "The fix wasn't a better prompt. It was architectural: the agent converses, but sensitive decisions need state, functions, deterministic exits and backend proof. “I've created a ticket” only counts if a ticket function actually returned success.",
    evidence: {
      note: "From the repository. Audit definitions changed over time, so read these as evidence of production measurement, not a controlled experiment.",
      items: [
        { value: "500", label: "calls reviewed in a July production audit" },
        { value: "531 / 654", label: "calls verified successfully in a September verification cohort" },
        { value: "99/195 → 296/346", label: "phone-route verification, late July vs. Sep 10–22" },
        { value: "58", label: "regression cases, 35 of them P0 / core release gates" }
      ]
    },
    sample: {
      label: "From the public reconstruction · src/operations.js",
      code: 'if (protectedBeforeVerified) flags.push("verification_bypass");\nif (promisedAction && !functionSuccess) flags.push("promised_without_evidence");\nif (ticketResults.length > 1) flags.push("duplicate_ticket_risk");'
    },
    media: [
      { src: "/assets/img/va-inbound-call-library.webp", w: 1320, h: 1222, alt: "Redacted call library grouping production calls by request type, with findings and issue counts.", caption: "Production calls grouped by request, with findings and issues. Identifiers removed." },
      { src: "/assets/img/va-inbound-regression.webp", w: 1048, h: 999, alt: "Regression sheet: 58 tests, 35 P0, release-gate rules per change type, and issue classes such as VER-SKIP, TICKET-MISSING and TRANSFER-MISSING.", caption: "The regression gate: which tests must rerun for which kind of change, and the issue classes they map to." },
      { src: "/assets/img/va-inbound-call-debug.webp", w: 1440, h: 1000, alt: "Redacted call review: findings with timestamps, main issue, rating and a generated review object.", caption: "Reviewing a single call: confirmed findings, main issue and a structured review object." }
    ],
    stack: ["Leaping (dialogue, switch, junction, field setter, function, transfer stages)", "Function / tool calls", "MCP / backend components", "Call-export analysis", "Regression testing"],
    repo: "https://github.com/zayzyyazy/voice-agent-inbound-operations",
    demo: null
  },
  {
    slug: "scheduler",
    family: "voice",
    number: "02",
    title: "Appointment Scheduler",
    category: "Voice agents · Leaping",
    tagline: "An outbound voice agent that turns a spoken “yes” into a real calendar booking, and only confirms once the booking exists.",
    focus: "Outbound · field binding · calendar tool · confirm on success",
    status: "Production work · proof of concept proven end to end",
    related: [
      { slug: "inbound", text: "Same production work, different problem: Inbound Voice Operations is about routing, verification and proving that promised actions actually happened." }
    ],
    problem:
      "Production call review kept showing callers interested in a consultation appointment, but the answer was an email or a callback promise: someone should follow up. A voice agent that only collects interest leaves the work undone, and one that confirms too early creates appointments that don't exist.",
    system:
      "An outbound Leaping flow. A consultation dialogue decides whether the caller wants an appointment, a deterministic function stage calls create_appointment with field-bound arguments, and a junction checks appointment_created before anything is confirmed. Behind the tool, the backend handled availability, re-checked it right before booking, created the appointment and returned success or failure.",
    workflow: {
      src: "/assets/img/va-scheduler-leaping.webp", w: 1444, h: 1142,
      full: "/assets/img/va-scheduler-leaping.webp", fw: 1444, fh: 1142,
      alt: "The real outbound scheduling workflow in Leaping Studio, heavily redacted: start, get_now, consultation and appointment-choice dialogues, appointment function, result junction, success field setters and completion, with numbered markers.",
      caption: "The real Leaping Studio canvas, cropped and heavily redacted. Prompt bodies and identifying wording are removed.",
      platform: "Leaping",
      stages: [
        { x: 13.9, y: 32.0, title: "Start", nodes: "Agent Setup → Start", note: "An outbound call with structured caller, customer and call fields." },
        { x: 11.4, y: 38.5, title: "Time context", nodes: "Function: get_now", note: "Current time, so the agent can understand date language." },
        { x: 27.1, y: 24.5, title: "Consultation", nodes: "Dialogue → termin · kein-interesse", note: "Does the caller want a consultation appointment?", kind: "ai" },
        { x: 7.6, y: 49.0, title: "Appointment choice", nodes: "Dialogue → kein-termin · termin-buchen · technischer-fehler", note: "Book, no appointment, or a technical problem." },
        { x: 22.3, y: 46.6, title: "No-appointment exit", nodes: "Dialogue: Kein Termin bestätigen → zurueck-zur-termin · kein-termin-bestaetigt", note: "Confirms the caller really doesn't want one. No calendar task is created." },
        { x: 23.4, y: 64.2, title: "Booking tool", nodes: "Function stage (label redacted; create_appointment in the export)", note: "Arguments come from fields: name, phone, reason, call_id, session_id, customer_id.", kind: "rule" },
        { x: 42.2, y: 58.5, title: "Check the result", nodes: "Junction: field(appointment_created) == true", note: "The conversation can't decide this. The tool result does.", kind: "rule" },
        { x: 65.4, y: 37.7, title: "Success path only", nodes: "Field Setter: leaping_conversation_usecase_successful = true", note: "Set only after the booking actually exists." },
        { x: 47.3, y: 70.3, title: "Failure path", nodes: "Junction False · technischer-fehler → Field Setter (redacted)", note: "No confirmation is spoken when the tool fails.", kind: "exception" },
        { x: 87.1, y: 44.2, title: "Close", nodes: "Scripted: goodbye · Field Setter: leaping_conversation_completed = true → End", note: "An auditable final state for every call." }
      ]
    },
    built: [
      "Built the consultation-to-booking path in Leaping, with no-interest and no-appointment exits so the workflow wouldn't create false calendar tasks.",
      "Connected a deterministic appointment function stage and mapped caller, phone, customer, call, session, reason and current-time context into structured tool arguments.",
      "Separated “caller agreed” from “appointment created”, and set success/completion fields only after the booking path.",
      "Proved the path end to end as a proof of concept, with calendar creation and notification. Production hardening is kept out of the public repo."
    ],
    interesting:
      "The hard part wasn't date small talk. It was keeping speech aligned with system state: the model handles conversation and date language, but calendar state stays deterministic, and the agent can't say “you're booked” until the tool says so.",
    sample: {
      label: "From the public reconstruction · booking result",
      code: '// tool succeeded\n{ "bookingStatus": "confirmed", "usecaseSuccessful": true,\n  "messagePolicy": "confirm only after tool success" }\n\n// tool failed or wasn\'t called\n{ "bookingStatus": "not_confirmed", "usecaseSuccessful": false }'
    },
    media: [
      { src: "/assets/img/va-scheduler-bindings.webp", w: 1500, h: 760, alt: "Sanitized appointment tool binding: name, phone, reason, call_id, session_id and customer_id bound to Leaping fields or literals.", caption: "Sanitized from the real export: the booking tool gets structured arguments from Leaping fields, not from the transcript." },
      { src: "/assets/img/va-scheduler-topology.webp", w: 1600, h: 900, alt: "Stage list rendered from a Leaping export: consultation dialogues, create_appointment function, exits, success and completion field setters.", caption: "Stage list rendered from a real Leaping JSON export (not a UI screenshot)." }
    ],
    stack: ["Leaping (outbound)", "Function stage + field bindings", "MCP / tool layer", "Calendar backend"],
    repo: "https://github.com/zayzyyazy/voice-agent-appointment-scheduler",
    demo: null
  },
  {
    slug: "waybill",
    number: "03",
    title: "Waybill",
    category: "Shipment reconciliation",
    tagline: "Three systems disagree about an order. Waybill works out which orders need a person, and why.",
    status: "Portfolio system · synthetic data",
    problem:
      "Checking an order by hand means looking it up in Shopify, in the carrier's tracking and in a folder of delivery documents, then deciding which source to trust when they disagree. It's slow, repetitive, and the judgment calls end up in someone's head.",
    system:
      "An n8n workflow that pulls fulfilments from Shopify, matches carrier tracking by tracking number, searches Google Drive for proof of delivery or customs documents when the rules require it, and rolls everything up into one status per order: HEALTHY, WATCH or EXCEPTION, with issue codes and a recommended action.",
    workflow: {
      src: "/assets/img/waybill-n8n.webp", w: 1600, h: 554,
      full: "/assets/img/waybill-n8n-full.webp", fw: 1990, fh: 688,
      alt: "The real Waybill n8n workflow canvas, with numbered markers on its main stages.",
      caption: "The real n8n canvas, cropped. Private Shopify endpoint labels are redacted.",
      stages: [
        { x: 4.4, y: 20.3, title: "Order form", nodes: "WAYBILL — Order Intelligence", note: "A form trigger takes the order to check." },
        { x: 13.2, y: 20.3, title: "Shopify", nodes: "Get Shopify Access Token → Get WAYBILL Orders", note: "Client-credentials token, then an Admin GraphQL query." },
        { x: 26.1, y: 20.3, title: "Extract shipments", nodes: "Extract Shipments", note: "Tracked fulfilments from tagged orders." },
        { x: 32.8, y: 20.3, title: "Carrier lookup", nodes: "Get Carrier Tracking", note: "REST call with retries, and separate success and error outputs." },
        { x: 33.8, y: 84.6, title: "Carrier error branch", nodes: "Normalize Carrier Error", note: "A failed call becomes WATCH + RETRY_CARRIER instead of a silent gap.", kind: "exception" },
        { x: 40.0, y: 11.5, title: "Evaluate", nodes: "Merge Shipment + Carrier State → Evaluate Shipment", note: "Match by tracking number; apply the shipment rules." },
        { x: 48.8, y: 32.4, title: "Document check?", nodes: "Prepare Document Check → Document Check Required?", note: "Only shipments that need POD or customs evidence go to Drive." },
        { x: 36.4, y: 54.8, title: "Drive lookup", nodes: "Search Supporting Documents → Evaluate Document Result → Apply Document Decision", note: "A missing required document becomes EXCEPTION." },
        { x: 64.3, y: 29.4, title: "Rejoin", nodes: "Rejoin Shipment Results · Rejoin Carrier Errors", note: "Every path, including failures, merges before the roll-up." },
        { x: 77.2, y: 35.3, title: "Roll up", nodes: "Roll Up Order State", note: "The highest shipment severity sets the order state." },
        { x: 84.4, y: 35.3, title: "Response", nodes: "Build WAYBILL Response → Select Requested Order → Result", note: "The form returns status, issue codes and recommended actions." }
      ]
    },
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
    media: [],
    stack: ["n8n", "Shopify Admin GraphQL", "REST APIs", "Google Drive", "JavaScript rules"],
    repo: "https://github.com/zayzyyazy/n8n-waybill-reconciliation",
    demo: null
  },
  {
    slug: "paperguard",
    number: "04",
    title: "PaperGuard",
    category: "Document validation",
    tagline: "Checks a document against a specification and says exactly what's wrong, and what it isn't sure about.",
    status: "Portfolio system · template-sensitive parser",
    problem:
      "Checking a document against a formatting specification means dozens of small comparisons: fonts, margins, spacing, section order, abstract length, citations. They're tedious, easy to miss, and every reviewer does them a little differently.",
    system:
      "An n8n workflow that takes an uploaded .docx, reads its underlying OOXML structure, checks it against an explicit pack of 18 policies, and returns PASS, FAIL or REVIEW_REQUIRED for each one, with the expected value next to what was actually found.",
    workflow: {
      src: "/assets/img/paperguard-n8n.webp", w: 1600, h: 634,
      full: "/assets/img/paperguard-n8n-full.webp", fw: 2020, fh: 800,
      alt: "The real PaperGuard n8n workflow canvas, with numbered markers on its main stages.",
      caption: "The full n8n workflow, as built. Built-in nodes only, no AI credential.",
      stages: [
        { x: 6.3, y: 13.3, title: "Upload", nodes: "On form submission", note: "A .docx uploaded through an n8n form." },
        { x: 9.8, y: 57.6, title: "Unpack the DOCX", nodes: "Prepare DOCX as ZIP → Compression → Parse DOCX Structure", note: "A DOCX is a ZIP. Read document.xml and styles.xml." },
        { x: 18.5, y: 22.1, title: "Normalize", nodes: "Normalize Document Structure → Resolve Effective Formatting", note: "Paragraphs, runs, spacing, margins, headings." },
        { x: 36.1, y: 22.1, title: "Load the policy pack", nodes: "Load University Policy", note: "18 explicit rules. The pack's identity is illustrative." },
        { x: 45.8, y: 22.1, title: "Deterministic checks", nodes: "Validate Formatting Rules → Required Sections → Citations & References → Margins → Heading Hierarchy", note: "Code checks things that have right answers." },
        { x: 44.0, y: 53.2, title: "Review heuristics", nodes: "Validate Figures → Validate Long Quotations", note: "Unclear figure sources or quotations become REVIEW_REQUIRED.", kind: "human" },
        { x: 66.9, y: 53.2, title: "Report", nodes: "Build PAPERGUARD Report", note: "PASS / FAIL / REVIEW_REQUIRED per policy, expected vs. detected." },
        { x: 76.6, y: 53.2, title: "Result", nodes: "Build Form Result → Form", note: "A readable result for the person who uploaded it." }
      ]
    },
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
      { src: "/assets/img/paperguard-report.webp", w: 892, h: 1088, alt: "PaperGuard result for a test document: 7 of 18 requirements passed, listing issues with expected and detected values.", caption: "The result for one test document. Not an accuracy metric." }
    ],
    stack: ["n8n", "JavaScript", "DOCX / OOXML", "Structured JSON reports"],
    repo: "https://github.com/zayzyyazy/n8n-paperguard-document-validator",
    demo: null
  },
  {
    slug: "northstar",
    number: "05",
    title: "NorthStar",
    category: "AI-assisted decisions",
    tagline: "Rules first, AI within limits, and a person makes the final call.",
    status: "Portfolio system · synthetic data",
    problem:
      "Deciding what to do with a returned item mixes fixed restrictions with judgment. An unconstrained AI recommendation can ignore rules that must never be broken; a fully manual process repeats the same lookups and calculations for every return.",
    system:
      "An n8n workflow where hard rules run first, a local model recommends an action within those limits, guardrails resolve the result, and an employee accepts or overrides it. Repeated corrections can become new policies, but only after a manager approves them.",
    workflow: {
      src: "/assets/img/northstar-n8n.webp", w: 1500, h: 919,
      full: "/assets/img/northstar-n8n.webp", fw: 1500, fh: 919,
      alt: "The real NorthStar n8n workflow canvas: the decision path on the right, correction analysis and manager approval on the left, with numbered markers.",
      caption: "The real canvas, cropped. The internal AI endpoint label is redacted.",
      stages: [
        { x: 54.3, y: 32.9, title: "Return form", nodes: "On form submission", note: "Inspection details for one returned item." },
        { x: 52.9, y: 20.0, title: "Normalize + lookup", nodes: "Normalize Return Input → Lookup Northstar Product → Product Found?", note: "Match the SKU to the embedded catalog." },
        { x: 63.4, y: 37.1, title: "Policies", nodes: "Load Northstar Policies → Build Policy Context", note: "Policies live in n8n Data Tables." },
        { x: 82.7, y: 3.3, title: "Economics", nodes: "Calculate Recovery Economics", note: "Refurbishment recovery vs. scrap value, supplier window." },
        { x: 83.1, y: 31.8, title: "Hard rules", nodes: "Evaluate Hard Rules → Match Relevant Policies", note: "Deterministic restrictions run before any AI.", kind: "rule" },
        { x: 80.5, y: 46.8, title: "AI recommendation", nodes: "Prepare Decision Context → Local AI Decision → Parse AI Decision", note: "Ollama-compatible endpoint; malformed output falls back to MANUAL_REVIEW.", kind: "ai" },
        { x: 51.0, y: 61.7, title: "Guardrails", nodes: "Apply Final Decision Guardrails", note: "Allowed actions only. Hard rules override the model.", kind: "rule" },
        { x: 57.5, y: 61.7, title: "Employee review", nodes: "Employee Review Decision → Was Decision Overridden? → Override Details", note: "A person accepts or overrides every recommendation.", kind: "human" },
        { x: 74.5, y: 77.7, title: "Decision history", nodes: "Build Final Human Decision → Save Decision History", note: "System action, human action, reason, timestamp." },
        { x: 6.4, y: 37.1, title: "Find corrections", nodes: "Load Human Overrides → Detect Correction Patterns", note: "Manually triggered analysis of past overrides." },
        { x: 7.1, y: 53.1, title: "Propose a policy", nodes: "Candidate Rule Ready? → Generate Candidate Rule → Save Pending Candidate", note: "≥ 3 distinct returns with the same correction → PENDING candidate." },
        { x: 6.4, y: 71.3, title: "Manager approval", nodes: "Manager Rule Approval → Load Pending Candidate → Rule Approved?", note: "Nothing becomes policy without an explicit APPROVE.", kind: "human" },
        { x: 30.7, y: 86.2, title: "Activate", nodes: "Prepare Approved Policy → Activate Learned Policy → Update row(s)", note: "The approved rule joins the policy table." }
      ]
    },
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
      { src: "/assets/img/northstar-review-loop.webp", w: 696, h: 567, alt: "Close-up of the NorthStar candidate generation and manager approval branches.", caption: "Close-up: repeated corrections create pending candidates; a separate approval path activates them." }
    ],
    stack: ["n8n", "JavaScript rules", "Ollama", "n8n Data Tables", "Human review forms"],
    repo: "https://github.com/zayzyyazy/n8n-northstar-human-review",
    demo: null
  },
  {
    slug: "call-qa",
    number: "07",
    title: "AI Call QA Cockpit",
    category: "Call review tool",
    tagline: "A desktop workspace for reviewing support calls, where AI drafts the analysis and a reviewer owns it.",
    status: "Desktop app · later evolved into a domain-specific version",
    related: [
      { slug: "incident-room", text: "Same problem space: AI voice and support agents. The Cockpit is for reviewing many calls and spotting recurring issues. Incident Room goes deep on a single failure. The two are separate apps, not integrated." },
      { slug: "inbound", text: "Its domain-specific successor is the tool behind the call-review screenshots in Inbound Voice Operations." }
    ],
    problem:
      "Improving a voice or support agent means listening to calls, writing down what went wrong, and noticing when the same problem keeps coming back. Usually that lives in scattered notes, and patterns across calls get lost.",
    system:
      "A desktop app that imports call recordings, transcribes them, drafts an analysis (caller intent, call result, main issue, likely root cause), and lets a reviewer correct it, pin evidence to moments in the call, and link issues across calls. Experiments track which prompt or workflow change was tried for which issue.",
    flowLabel: "Conceptual flow",
    flowNote: "A simplified overview of the app's review loop, not a diagram of the code. No screenshots: the app is built to hold real call recordings.",
    flow: [
      { kind: "input", label: "Import", title: "Call recording", note: "copied into app storage" },
      { kind: "ai", label: "Transcribe", title: "Speech-to-text" },
      { kind: "ai", label: "Draft", title: "Intent, result, issue, root cause", note: "a draft, not a verdict" },
      { kind: "human", label: "Review", title: "Reviewer edits the analysis, pins evidence moments" },
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
    number: "08",
    title: "Incident Room",
    category: "AI incident investigation",
    tagline: "The customer was told it worked. Did it actually work?",
    status: "Team hackathon project · deployed demo",
    related: {
      slug: "call-qa",
      text: "Same problem space: AI voice and support agents. Where the Call QA Cockpit reviews many calls for recurring issues, Incident Room investigates one failure in depth. Separate apps, not integrated."
    },
    problem:
      "AI support and voice agents can confidently tell a customer “your order is placed” while the tool call behind it did nothing. The conversation looks successful; the backend shows a no-op. Nobody notices until the customer does.",
    system:
      "An investigation desk that captures a failed interaction as structured evidence in three layers (the conversation, the tool calls and side effects, and the customer context), then runs investigation agents that look at those layers separately before a judge compares them and writes a report.",
    flowLabel: "Conceptual flow",
    flowNote: "A simplified view of the investigation. The real system runs several agents in Band rooms with fallbacks.",
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
    media: [
      { src: "/assets/img/incident-timeline.webp", w: 1400, h: 569, alt: "Incident Room timeline for a demo call: the agent confirms a rescheduled appointment, but the reschedule tool returned a 503 and no appointment or CRM record was created.", caption: "From the app, with a fictional demo call: the agent says “you're rescheduled”, the tool returned a 503, and nothing was created." }
    ],
    stack: ["Next.js", "TypeScript", "MongoDB", "LangGraph", "Band agents", "pdf-lib"],
    repo: "https://github.com/zayzyyazy/Incident-Room",
    demo: "https://incident-room.vercel.app"
  },
  {
    slug: "explainer",
    number: "06",
    title: "Project Explainer OS",
    category: "Codebase investigation",
    tagline: "You inherited a repo. Now what? Drop in a folder and get what it does, how to run it, and what to watch out for.",
    status: "Working app · runs locally with your own API key",
    problem:
      "Someone hands you a codebase: a contractor handoff, a bought product, your own project from six months ago. The README is vague, nobody knows which env vars matter, and a generic AI chat gives you a fluffy summary instead of answers you can check.",
    system:
      "A web app where you upload a project folder or ZIP (or pick one of three deliberately messy sample repos). It scans the README, configs and priority source files, pulls hard facts out with deterministic extractors, classifies what kind of project it is, and only then asks a model for a structured report: what it is, the stack, how it's built, how to run it, and the risks. Each section can be expanded with code-grounded follow-ups.",
    flowLabel: "System overview",
    flowNote: "Simplified, but each step corresponds to a real module in the repository's lib/ folder.",
    flow: [
      { kind: "input", label: "Upload", title: "Folder or ZIP", note: "folder-upload.ts · adm-zip" },
      { kind: "step", label: "Scan", title: "README-first scanner", note: "scanner.ts: skips node_modules, lockfiles; capped at 20 files' contents" },
      { kind: "rule", label: "Extract", title: "Routes, scripts, env vars, Prisma models, agent nodes", note: "extractors.ts: deterministic, before the model sees anything" },
      { kind: "rule", label: "Classify", title: "Archetype: web SaaS, API service, multi-agent, automation…", note: "archetype.ts: rules + signals" },
      { kind: "ai", label: "Report", title: "LLM → structured JSON report", note: "prompt.ts · normalize-report.ts, incl. “README vs reality”" },
      { kind: "output", label: "Explore", title: "Report cards, Expand, Ask AI", note: "expand-context.ts: grounded on scanned snippets" }
    ],
    built: [
      "The whole app: the upload flow, the README-first scanner with its file and size caps, and the deterministic extractors.",
      "The archetype classifier, the report prompt and schema (including a “README vs reality” field), and the report normalization.",
      "The card report UI with Expand and Ask AI, plus three intentionally messy sample repos to test it against.",
      "An earlier desktop version (Tauri, Rust, Claude API, SQLite library) that it grew out of."
    ],
    interesting:
      "The model doesn't get to guess first. Routes, env vars, scripts and dependencies are extracted from the code before the LLM writes anything, and the report has to say where the README oversells what the code actually ships.",
    sample: {
      label: "Report excerpt for the bundled “Webhook Worker” sample",
      code: "WATCH OUT · Risks & gaps\n• No tests for webhook signature verification\n• Retry and dead-letter behavior undocumented\n• README silent on Shopify setup\n\nASK WHOEVER BUILT THIS\n• What happens when Redis is down?"
    },
    media: [
      { src: "/assets/img/explainer-report.webp", full: "/assets/img/explainer-report-full.webp", w: 1440, h: 1130, fw: 1440, fh: 2384, alt: "Project Explainer report for the Webhook Worker sample: what it is, tech stack, structure and data flow, run and deploy, risks and gaps.", caption: "The report for one of the bundled sample repos. Click to see the full page." },
      { src: "/assets/img/explainer-workspace.webp", w: 1440, h: 900, alt: "Project Explainer project desk: three sample repos and a folder or ZIP upload area.", caption: "The project desk: try a sample or upload a folder / ZIP." }
    ],
    stack: ["Next.js 15", "React 19", "TypeScript", "adm-zip", "LLM APIs (AI/ML API, Anthropic, OpenAI-compatible)"],
    repo: "https://github.com/zayzyyazy/Project-explainer2",
    extraLinks: [{ label: "Earlier desktop version", url: "https://github.com/zayzyyazy/project-explainer" }],
    demo: null
  },
  {
    slug: "knowledge",
    hidden: true,
    number: "—",
    title: "Local AI Knowledge System",
    category: "Personal infrastructure",
    tagline: "Capture things once, find them again later, all running on my own machine.",
    status: "Personal system · no public repository",
    problem:
      "Useful information ends up spread across notes, folders and documents. Finding the right piece later usually means remembering where you put it.",
    system:
      "A local-first pipeline: things I capture are structured by n8n workflows, stored, embedded and indexed in a vector database, so a local model can retrieve the relevant pieces when I ask.",
    flowLabel: "Conceptual flow",
    flow: [
      { kind: "input", label: "Capture", title: "Webhook / Drive" },
      { kind: "step", label: "Orchestrate", title: "n8n workflow" },
      { kind: "step", label: "Structure", title: "Structured record → Drive" },
      { kind: "ai", label: "Embed", title: "Embeddings" },
      { kind: "step", label: "Index", title: "Qdrant vector search" },
      { kind: "output", label: "Retrieve", title: "Local model via Ollama" }
    ],
    built: ["The ingestion workflows in n8n.", "The local stack they run on: Docker, Ollama and Qdrant."],
    interesting:
      "It's infrastructure rather than a product: the point was to understand every moving part of a retrieval system by running it locally, end to end.",
    sample: null,
    media: [],
    stack: ["Docker", "n8n", "Ollama", "Qdrant", "Google Drive"],
    repo: null,
    demo: null
  }
];
