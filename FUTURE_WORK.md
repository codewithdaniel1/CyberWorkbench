# Future Work: CyberSLM-Assisted CyberChef

## Product goal

Build a strong local CyberSLM that can analyze cybersecurity and cryptography inputs—plain text, encoded data, logs, binaries, documents, archives, and other files—and recommend or assemble the right CyberChef recipe automatically.

The desired flow is:

1. A user pastes text or drops in a file.
2. CyberSLM inspects the input locally and identifies likely encodings, ciphers, file types, indicators, and useful next steps.
3. It proposes a CyberChef recipe, such as `From Base64` → `Gunzip` → `Extract strings`, or `From Hex` → `XOR Brute Force`.
4. CyberChef automatically adds the proposed operations to the recipe in the right order.
5. The user can review, edit, accept, or reject the recipe before it is run.
6. CyberSLM explains its confidence, evidence, and output so the workflow remains understandable and reproducible.

## Capabilities to add

- Local text and file intake, including drag-and-drop.
- Input triage: file signatures, entropy, encoding detection, hash recognition, compression detection, and binary/string inspection.
- Crypto-focused reasoning: Base64/hex/URL encodings, common substitution/rotation ciphers, XOR, hashes, certificates, JWTs, and layered encodings.
- Recipe planner that maps model recommendations to CyberChef operation names and validated arguments.
- Recipe executor that inserts operations into CyberChef instead of merely describing them.
- Confidence scores and an explanation of each operation before execution.
- One-click presets for common workflows: decode layers, suspicious URL analysis, IOC extraction, hash identification, JWT inspection, PowerShell decoding, and file triage.
- Local history of inputs, proposed recipes, results, and user corrections for evaluation and improvement.

## Safety and quality requirements

- Keep analysis local by default; do not send input, files, or recipes to external services.
- Require user approval before running a generated recipe, especially expensive operations or brute force attempts.
- Limit resource-intensive operations by file size, execution time, and worker count.
- Preserve an auditable recipe: every automated action must produce an ordinary CyberChef recipe the user can inspect and save.
- Evaluate the model against a curated corpus of crypto puzzles, CTF challenges, malware samples, logs, common encodings, and malformed inputs.

## Suggested delivery phases

### Phase 1 — Assisted triage

Add a local AI panel that summarizes pasted text or a selected file and suggests a recipe in plain language. The user manually adds operations.

### Phase 2 — Recipe proposal

Translate model output into a structured recipe schema. Show a visual preview with operation names, arguments, confidence, and rationale.

### Phase 3 — One-click insertion

Add an integration bridge that inserts the approved structured recipe into CyberChef’s recipe pane and optionally runs it.

### Phase 4 — Evaluation and refinement

Build repeatable evaluations for correct operation choice, argument accuracy, ordered multi-step recipes, output quality, latency, and unsafe recommendations.

### Phase 5 — Agentic local workbench

Let CyberSLM iteratively inspect outputs, propose the next step, and stop for user confirmation at defined checkpoints.
