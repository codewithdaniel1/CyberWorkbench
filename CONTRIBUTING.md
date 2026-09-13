# Contributing to Cyber Workbench

Cyber Workbench combines upstream CyberChef with a small Tauri desktop shell and local Ollama bridge. Contributions should preserve CyberChef's local-first model and avoid adding cloud dependencies unless explicitly justified.

## Setup

Use Node.js 24–26 and Rust. Then run:

```sh
npm install
```

Useful checks:

```sh
npm run lint
npm test
npm run desktop:bundle
```

## Where changes belong

- CyberChef engine and operations: `src/` and its existing tests.
- Workbench shell and AI behavior: `desktop/`.
- Tauri launcher and packaging: `src-tauri/`.

For a new CyberChef operation, use `npm run newop`, implement it under `src/core/operations/`, and add tests under `tests/operations/tests/`.

## Pull requests

1. Branch from `main` in this repository.
2. Keep changes focused and include tests where practical.
3. Run the relevant checks before opening a pull request.
4. Describe any local-model behavior, prompt change, or privacy implication.

This is a derivative project, not GCHQ's CyberChef repository. Do not submit Cyber Workbench-specific changes to upstream CyberChef. Upstream-compatible CyberChef fixes can be proposed separately to [GCHQ/CyberChef](https://github.com/gchq/CyberChef) under its contribution rules.
