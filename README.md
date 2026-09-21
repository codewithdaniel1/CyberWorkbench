# Cyber Workbench

Cyber Workbench is a macOS desktop workbench built around [CyberChef](https://github.com/gchq/CyberChef). It keeps CyberChef's browser-local data transformation engine and adds a local Ollama/CyberSLM analysis panel.

## What works today

- **Chef** — the full CyberChef operation, recipe, input, and output workspace.
- **Local AI analysis** — connect to an already-installed Ollama model at `http://127.0.0.1:11434`; no cloud endpoint or model download is used by the app.
- **Chef-to-AI handoff** — **Analyze Chef workspace with CyberSLM** opens the AI view with a readable pre-filled snapshot of the original input, current recipe, and current output.
- **Grounded operation suggestions** — the harness indexes all 505 operations in the bundled CyberChef build, retrieves a relevant shortlist for each intermediate value, validates arguments against live definitions, and explains when a requested operation needs a key or other missing input. Not every operation is safe to run automatically.
- **Automatic local solve loop** — **Analyze locally** explores alternative recipe branches with real CyberChef execution, fingerprints full outputs to avoid loops, and keeps the best tested result within ten trials. An optional **Goal** can steer retrieval. The visible Chef recipe never changes until you approve the proposed steps.
- **Analysis feedback** — progress, time, and Cancel make long local analysis visible and stoppable. The CyberWorkbench Harness streams model output, permits active reasoning, and stops stalled responses after 45 seconds of inactivity. It caps temporary work at ten trials, ten kept steps, 10 seconds per operation, and 1 MB of output, with a long emergency safety ceiling.
- **Local file triage** — inspect a local file's signature, size, hash, entropy, and safe text preview before asking Ollama. Text inputs can be loaded into Chef only after you approve a proposed recipe.
- **Separate local scorecards** — **Model quick/full** measures the selected Ollama model's one-shot recipe planning. **Harness quick/full** runs the same bounded search as **Analyze locally**, including the selected model's choices and checks, then grades both the recipe and final output. Quick covers four cases; Full covers 15. Every case expects at least one real operation and a concrete output. The model-only score is not a measure of end-to-end harness quality.

The **IOCs** and **History** navigation items are placeholders; the **Files** view provides initial local triage.

## Quick start

### Use the macOS app

Build a bundle with:

```sh
npm run desktop:bundle
```

The resulting app is placed at:

```text
src-tauri/target/release/bundle/macos/Cyber Workbench.app
```

Copy it to `/Applications` if you want it installed system-wide.

### Run from source

Prerequisites: Node.js 24–26, Rust, and the macOS Tauri prerequisites.

```sh
npm install
npm run desktop:prepare
cargo run --manifest-path src-tauri/Cargo.toml
```

For the web-only CyberChef development server, run `npm start`.

## Use local AI analysis

1. Install and start [Ollama](https://ollama.com/).
2. Use any model already installed in Ollama; Cyber Workbench does not download models.
3. Open **AI** in Cyber Workbench and select the model.
4. Either paste data into the text box, or build a recipe in **Chef** and choose **Analyze Chef workspace with CyberSLM**.
5. Review the temporary trace and proposed recipe. The solver never changes Chef until you explicitly choose **Add validated steps to Chef**.

The AI handoff contains only the current local workspace. Requests are sent only to Ollama on loopback (`127.0.0.1`).

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Build CyberChef production assets. |
| `npm run desktop:prepare` | Prepare the desktop web assets. |
| `npm run desktop:bundle` | Build the bundled macOS application. |
| `npm run lint` | Lint the source. |
| `npm run test:desktop` | Run file-triage, scorecard, and real-CyberChef harness regression tests. |
| `npm test` | Run CyberChef's Node and operation tests. |
| `npm start` | Run the upstream web development server. |

## Architecture

- `desktop/` — Cyber Workbench shell UI and Ollama bridge.
- `src-tauri/` — Tauri desktop application configuration and Rust launcher.
- `src/` — upstream CyberChef engine and operations.
- `scripts/prepareDesktop.mjs` — packages the desktop shell together with a production CyberChef build.

More detail is in [CYBER_WORKBENCH.md](CYBER_WORKBENCH.md). The next milestones are in [FUTURE_WORK.md](FUTURE_WORK.md).

## Upstream and licence

Cyber Workbench is a derivative of GCHQ's CyberChef. CyberChef's source, notices, and Apache-2.0 licence are retained in this repository. This project is not affiliated with or supported by GCHQ. Keep the `upstream` remote pointed at `https://github.com/gchq/CyberChef.git` when syncing future upstream changes.
