# Cyber Workbench architecture

## Product boundary

Cyber Workbench is a local-first desktop application. CyberChef performs transformations in the embedded browser view. The optional AI feature calls a model served by the user's local Ollama instance at `http://127.0.0.1:11434`.

No cloud AI endpoint is configured.

## Current desktop experience

The left navigation exposes Chef, AI, Files, IOCs, and History. Chef, AI, and the initial local Files triage are active; IOCs and History remain placeholders.

### Chef

Chef is the upstream CyberChef app packaged in an iframe, using the Workbench colour theme. It retains CyberChef's normal recipe construction and execution behavior.

### AI

The AI panel can receive pasted text or a Chef workspace snapshot. Selecting **Analyze Chef workspace with CyberSLM** extracts the real editor values, rather than rendered status-bar text:

- original input;
- current recipe configuration and arguments;
- current output;
- the current CyberChef operation registry.

The visible prompt is pre-filled with the workspace summary so the user can inspect or edit it. If the text area is edited, the request becomes a normal pasted-data analysis.

The harness indexes the exact operation definitions from the embedded CyberChef build, then retrieves a shortlist for each intermediate value. It verifies argument defaults, excludes flow-control and manually baked operations from automatic trials, and does not invent absent keys, IVs, or other secrets. The selected Ollama model may reorder candidate operations and review their results; real CyberChef execution and the ten-trial search limit remain authoritative. Alternate branches are preserved so a failed step can be rolled back. An optional user goal steers operation retrieval.

The AI panel offers separate **Model** scorecards for one-shot model planning and **Harness** scorecards for the same end-to-end search used by **Analyze locally**. Each can run the four-case Quick or 15-case Full corpus. The bundled synthetic corpus is a regression check, not proof that arbitrary cryptography has been solved. A versioned cryptography RAG is planned, not yet present.

Requests show an elapsed timer and can be cancelled with `AbortController`.

## Source layout

| Path | Responsibility |
| --- | --- |
| `desktop/index.html` | Workbench shell markup. |
| `desktop/app.js` | navigation, workspace extraction, prompt construction, and Ollama calls. |
| `desktop/catalog.mjs` | live CyberChef operation index and per-layer retrieval. |
| `desktop/operationArgs.mjs` | operation argument defaults and validation. |
| `desktop/harness.mjs` | bounded, branching recipe search using temporary CyberChef execution. |
| `desktop/evaluation.mjs` | shared scorecard cases and separate model/harness grading. |
| `desktop/app.css` | Workbench shell styling. |
| `src-tauri/` | Tauri configuration, desktop binary, icons, and bundle settings. |
| `src/web/stylesheets/themes/_workbench.css` | CyberChef's embedded Workbench theme. |
| `scripts/prepareDesktop.mjs` | copies `desktop/` and `build/prod/` into `build/workbench/`. |

## Build and install

```sh
npm run desktop:bundle
```

The command builds CyberChef, prepares `build/workbench`, and then runs `tauri build`. A full bundle can take several minutes; do not replace an installed app until the build process has actually exited.

The macOS bundle is generated at:

```text
src-tauri/target/release/bundle/macos/Cyber Workbench.app
```

To update an installed local app, quit it first and copy that bundle to `/Applications/Cyber Workbench.app`.

## Repository remotes

- `origin`: `https://github.com/codewithdaniel1/CyberWorkbench`
- `upstream`: `https://github.com/gchq/CyberChef.git`

Keep upstream changes separate from Cyber Workbench-specific desktop changes whenever practical.
