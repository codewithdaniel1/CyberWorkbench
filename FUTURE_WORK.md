# Future work

## End goal

Build a strong local CyberSLM-assisted workflow that can inspect text and files, reason about encodings, cryptography, file formats, and security artifacts, then propose a valid CyberChef recipe. The user must be able to review the evidence and approve any recipe before it is inserted or run.

## Completed foundation

- Packaged CyberChef in the Cyber Workbench macOS shell.
- Added a local Ollama connection and model chooser.
- Added clear running, completion, failure, and cancellation feedback.
- Added a clean Chef workspace handoff containing real input, recipe, and output values.
- Made the handoff visible and editable in the AI text area.
- Grounded recommendations in CyberChef's actual operation registry.

## Next releases

### Recent harness releases — completed locally

1. Indexed the full bundled CyberChef operation catalog and validated its argument defaults. Operations needing a key, IV, manual execution, or flow control are not silently tried; an exact requested operation with missing prerequisites is reported explicitly.
2. Replaced the fixed candidate loop with bounded branch search over real CyberChef outputs, full-output loop detection, an optional goal, and visible trial-by-trial progress. The visible Chef recipe still requires approval.
3. Separated the one-shot **Model** scorecard from the end-to-end **Harness** scorecard. Both use the same 4/15-case corpus, while Harness uses the same search path as **Analyze locally**. All 15 cases now have real-CyberChef regression coverage.

The next review is scorecard quality and CyberChef cryptography RAG. The existing synthetic corpus is useful for regression, but needs harder unseen cases, more cryptography prerequisites, and failure-mode diagnostics before it can measure general solving ability. RAG should start with a small, versioned, local knowledge corpus and be evaluated against this stronger holdout set; retrieval must never override CyberChef execution or supply nonexistent secrets.

### 1. Structured recipe proposal — completed

Ask the model for a validated schema: exact operation name, arguments, confidence, evidence, and rationale. Parse it defensively and show a recipe preview. Do not execute it yet.

### 2. Approved recipe insertion — completed

Add an explicit **Add proposed recipe to Chef** action. Validate every operation and argument against CyberChef before inserting it. Never silently replace a user's recipe.

### 3. File intake and triage — initial release completed

Implement the Files view and safe local file handoff. Add deterministic signals before model analysis: file signature, size, entropy, hashes, strings, archive/compression detection, and encoding checks.

### 4. Evaluation and regression corpus — temporary solver scorecard completed

Maintain a local corpus of known inputs, expected CyberChef operations, and expected final output. Run deterministic recipe, file-safety, temporary-solver, and selected-model checks before releasing changes. The AI tab's scorecard sends 15 bundled transform cases to the selected local Ollama model and reports recognition, exact recipe order, JSON reliability, and latency. Every scorecard case must contain at least one real CyberChef operation and a concrete final output. The model-facing operation catalog is read from the active CyberChef runtime, so it must never be replaced by a hand-maintained list. A separate solver regression check verifies temporary execution. Do not confuse a solver-regression score with a raw model-planning score.

### 5. CyberWorkbench Harness — initial bounded runtime complete

Cyber Workbench now uses a purpose-built local harness around CyberChef rather than a general coding-agent harness as the application's core runtime. The initial harness combines deterministic format and layer detection, a tightly constrained local-model planning call only when needed, temporary CyberChef execution, and validation against CyberChef's real operation and argument schemas.

The harness streams model output and allows active reasoning to continue. It stops a silent response after a fixed inactivity window, bounds generated tokens, temporary output size, and proposed steps, and retains a long emergency safety ceiling. The scorecard offers a short four-case Quick run and an optional 15-case Full run. Stalled calls are recorded as failed cases instead of waiting indefinitely, Cancel remains available, and the user sees an evidence-backed trace for each proposed operation. The temporary solve loop can now test up to ten operations, roll back a bad trial, exclude it for that intermediate state, and try another live CyberChef candidate; it also stops on repeated or unchanged output. Expand the harness later with more deterministic detectors and validated argument schemas.

### 6. CyberChef RAG — local cryptography and operation knowledge

Initial release completed: a versioned, local-only CyberChef Cryptography RAG is shared by every installed Ollama model. It retrieves up to four relevant knowledge cards based on the input, user goal, live candidate operations, and kept recipe steps. The first corpus covers layered encodings, compression, JWT limits, symmetric prerequisites, KDFs, hashes, PGP/public keys, XOR, classical ciphers, and signatures.

Examples of essential constraints: AES requires validated mode, key, IV, and ciphertext; hashes are one-way; PGP requires the appropriate private key or passphrase; JWT decoding does not verify a JWT. The RAG should improve grounded recipe suggestions, but CyberChef validation and temporary execution remain the authority.

### 7. Better local model capability (without requiring downloads)

The current models are useful as constrained planners, not trusted arbitrary transformation engines. Improve the local operation router, layer detector, and curated evaluation corpus around the installed models first. If the project later permits training, evaluate a specialized adapter or fine-tune against encodings, layered data, crypto puzzles, CTF inputs, logs, binaries, and malformed examples.

### 8. Local history

Measure correct operation choice, valid arguments, recipe order, output usefulness, latency, refusal quality, and unsafe recommendations. Add opt-in local history of inputs, proposed recipes, results, and user corrections.

## Safety requirements

- Keep data local by default.
- Treat model output as a suggestion, not an authority.
- Require user approval before adding or running AI-generated recipes.
- Bound expensive operations, file sizes, retries, and model input length.
- Preserve an ordinary, inspectable CyberChef recipe for every automated action.
