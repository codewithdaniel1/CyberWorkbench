# Local triage examples

These are five newly generated, harmless synthetic files for testing Cyber Workbench's local Files view and the AI recipe proposal flow. They replace the previous corpus.

| File | Useful test |
| --- | --- |
| `test1file` | Three layers: `From Base64` → `URL Decode` → `From Hex` → `signal: cobalt-iguana-731`. |
| `test2file` | `From Base64` → `Gunzip` → `archive-note: quartz-badger-902`. |
| `test3file` | Two URL-decoding passes, then `From Hex` → `packet: moss-otter-46`. |
| `test4file` | A newly generated synthetic JWT-like token; assess whether `JWT Decode` is justified. |
| `test5file` | Ordinary local text; the safe expected recipe is empty. |

None of these files contain malware, credentials, or real indicators of compromise.
