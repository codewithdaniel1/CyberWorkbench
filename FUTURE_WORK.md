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

### 4. Evaluation and regression corpus — current priority

Maintain a local corpus of known inputs and expected CyberChef operations. Run deterministic recipe and file-safety checks in CI before releasing changes. Expand the corpus with layered encodings, compression/archive samples, logs, binaries, malformed data, and expected abstentions.

### 5. Better local model capability

The current `gemma3-4b-cyberslm-appsec` model is AppSec-oriented, not a dedicated cryptography/data-transformation solver. Evaluate candidate local models and fine-tuning data against a curated corpus of encodings, layered data, crypto puzzles, CTF inputs, logs, binaries, and malformed examples.

### 6. Local history

Measure correct operation choice, valid arguments, recipe order, output usefulness, latency, refusal quality, and unsafe recommendations. Add opt-in local history of inputs, proposed recipes, results, and user corrections.

## Safety requirements

- Keep data local by default.
- Treat model output as a suggestion, not an authority.
- Require user approval before adding or running AI-generated recipes.
- Bound expensive operations, file sizes, retries, and model input length.
- Preserve an ordinary, inspectable CyberChef recipe for every automated action.
