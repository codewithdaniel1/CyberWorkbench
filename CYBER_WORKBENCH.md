# Cyber Workbench

Cyber Workbench is a local-first desktop shell around this CyberChef fork. It preserves CyberChef's browser-local processing model and adds a focused workspace for future security workflows.

## v0.1

- Chef: the upstream CyberChef engine, packaged inside the desktop application.
- AI: an Ollama bridge at `http://127.0.0.1:11434`; no cloud endpoint is configured.
- Files, IOCs, and History: intentionally visible placeholders for the next milestones.

## Run it

```sh
npm run desktop:prepare
cargo run --manifest-path src-tauri/Cargo.toml
```

The initial Cargo run downloads Tauri's Rust dependencies. To create a macOS app bundle instead, run:

```sh
npm run desktop:bundle
```

For the AI page, install/start Ollama and pull at least one local model first. The interface queries only the loopback address.

## Keeping the fork healthy

`origin` currently points to upstream GCHQ CyberChef. Before publishing your own GitHub fork, create it on GitHub, then change `origin` to that repository and retain `upstream` for GCHQ:

```sh
git remote rename origin upstream
git remote add origin git@github.com:YOUR-USERNAME/cyber-workbench.git
git push -u origin main
```

CyberChef is Apache-2.0 licensed; retain its license and notices when publishing this derivative work.
