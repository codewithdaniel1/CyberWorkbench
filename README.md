# Cyber Workbench

Cyber Workbench is a macOS desktop workbench built around [CyberChef](https://github.com/gchq/CyberChef). It keeps CyberChef's browser-local data transformation engine and adds a local Ollama/CyberSLM analysis panel.

## What works today

- **Chef** — the full CyberChef operation, recipe, input, and output workspace.
- **Local AI analysis** — connect to Ollama at `http://127.0.0.1:11434`; no cloud endpoint is used.
- **Chef-to-AI handoff** — **Analyze Chef workspace with CyberSLM** opens the AI view with a readable pre-filled snapshot of the original input, current recipe, and current output.
- **Grounded operation suggestions** — the AI receives CyberChef's live operation list and is instructed to recommend exact operation names only.
- **Analysis feedback** — a live elapsed-time indicator and Cancel button make long local model requests visible and stoppable.

The **Files**, **IOCs**, and **History** navigation items are placeholders; they are not implemented yet.

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
2. Pull or create a local model.
3. Open **AI** in Cyber Workbench and select the model.
4. Either paste data into the text box, or build a recipe in **Chef** and choose **Analyze Chef workspace with CyberSLM**.
5. Review the model's verdict and recommended recipe. Suggestions are not automatically applied.

The AI handoff contains only the current local workspace. Requests are sent only to Ollama on loopback (`127.0.0.1`).

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Build CyberChef production assets. |
| `npm run desktop:prepare` | Prepare the desktop web assets. |
| `npm run desktop:bundle` | Build the bundled macOS application. |
| `npm run lint` | Lint the source. |
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
