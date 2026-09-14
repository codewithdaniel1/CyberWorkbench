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

### 1. Structured recipe proposal — completed

Ask the model for a validated schema: exact operation name, arguments, confidence, evidence, and rationale. Parse it defensively and show a recipe preview. Do not execute it yet.

### 2. Approved recipe insertion — completed

Add an explicit **Add proposed recipe to Chef** action. Validate every operation and argument against CyberChef before inserting it. Never silently replace a user's recipe.

### 3. File intake and triage — initial release completed

Implement the Files view and safe local file handoff. Add deterministic signals before model analysis: file signature, size, entropy, hashes, strings, archive/compression detection, and encoding checks.

### 4. Evaluation and regression corpus — temporary solver scorecard completed

Maintain a local corpus of known inputs, expected CyberChef operations, and expected final output. Run deterministic recipe, file-safety, temporary-solver, and selected-model checks before releasing changes. The AI tab's scorecard sends 15 bundled encoding and common-crypto triage cases (including ROT13, XOR, AES metadata, SHA-256, PGP, JWT, and safe abstention) to the selected local Ollama model and reports recognition, exact recipe order, JSON reliability, and latency; a separate solver regression check verifies temporary execution. Do not confuse a solver-regression score with a raw model-planning score.

### 5. Better local model capability (without requiring downloads)

The current models are useful as constrained planners, not trusted arbitrary transformation engines. Improve the local operation router, layer detector, and curated evaluation corpus around the installed models first. If the project later permits training, evaluate a specialized adapter or fine-tune against encodings, layered data, crypto puzzles, CTF inputs, logs, binaries, and malformed examples.

### 6. Local history

Measure correct operation choice, valid arguments, recipe order, output usefulness, latency, refusal quality, and unsafe recommendations. Add opt-in local history of inputs, proposed recipes, results, and user corrections.

## Safety requirements

- Keep data local by default.
- Treat model output as a suggestion, not an authority.
- Require user approval before adding or running AI-generated recipes.
- Bound expensive operations, file sizes, retries, and model input length.
- Preserve an ordinary, inspectable CyberChef recipe for every automated action.
