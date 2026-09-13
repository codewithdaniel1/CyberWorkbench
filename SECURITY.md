# Security policy

## Supported version

Security fixes are made against the current `main` branch of Cyber Workbench.

## Reporting a vulnerability

Do not publish a vulnerability before a fix is available. Use a private GitHub security advisory for the [Cyber Workbench repository](https://github.com/codewithdaniel1/CyberWorkbench/security/advisories/new) when available, or contact the repository owner through GitHub with the details needed to reproduce the issue.

For vulnerabilities in unmodified upstream CyberChef code, follow [CyberChef's upstream security policy](https://github.com/gchq/CyberChef/blob/master/SECURITY.md) as well.

## Local AI boundary

Cyber Workbench sends AI requests only to Ollama on `127.0.0.1:11434`. The selected local model may produce incorrect or unsafe suggestions. Treat all AI output as untrusted guidance and review it before manually applying transformations.
