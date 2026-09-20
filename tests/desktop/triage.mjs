import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
    chefTextInput,
    detectFileType,
    deterministicRecipe,
    deterministicRecipeChain,
    entropy,
    safeTextPreview,
} from "../../desktop/triage.mjs";

const encoder = new TextEncoder();
const cases = [
    ["Base64 padded text", "d2hhdHMgdXA=", "From Base64"],
    ["Base64 with whitespace", "d2hh\ndHMgdXA=", "From Base64"],
    ["hex byte pairs", "43 79 62 65 72 20 57 6f 72 6b 62 65 6e 63 68 0a", "From Hex"],
    ["percent-encoded URL", "https%3A%2F%2Fexample.invalid%2Fdownload", "URL Decode"],
    ["ordinary prose", "Cyber Workbench is local-first.", null],
    ["ambiguous word", "test", null],
    ["unpadded ambiguous Base64", "d2hhdHMgdXA", null],
];

for (const [name, input, expected] of cases) {
    assert.equal(deterministicRecipe(input)?.op || null, expected, name);
}

assert.equal(detectFileType(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d])), "PDF document");
assert.equal(detectFileType(Uint8Array.from([0x50, 0x4b, 0x03, 0x04])), "ZIP archive (or Office document)");
assert.equal(detectFileType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47])), "PNG image");
assert.equal(detectFileType(encoder.encode("plain text\n")), "Text data");
assert.equal(detectFileType(Uint8Array.from([0, 255, 1, 254])), "Unknown / inspect with CyberChef");
assert.equal(safeTextPreview(Uint8Array.from([65, 0, 66])), "Binary content detected; text preview omitted.");
assert.equal(chefTextInput(Uint8Array.from([65, 0, 66])), "");
assert.equal(chefTextInput(encoder.encode("hello")), "hello");
assert.equal(entropy(Uint8Array.from([0, 0, 0, 0])), 0);

const layeredInput = (await readFile(new URL("../../examples/triage/test1file", import.meta.url), "utf8")).trim();
const layered = deterministicRecipeChain(layeredInput);
assert.deepEqual(layered.steps.map((step) => step.op), ["From Base64", "URL Decode", "From Hex"]);
assert.equal(layered.output, "signal: cobalt-iguana-731\n");

// Regression: test3file is three deterministic layers. The agent harness must
// take this exact local chain without requiring a model to approve each layer.
const test3Input = (await readFile(new URL("../../examples/triage/test3file", import.meta.url), "utf8")).trim();
const test3 = deterministicRecipeChain(test3Input);
assert.deepEqual(test3.steps.map((step) => step.op), ["URL Decode", "URL Decode", "From Hex"]);
assert.equal(test3.output, "packet: moss-otter-46\n");

// A decoded layer can be readable text while still being another verified
// encoding. The solver must continue through every verified layer.
const fourLayerInput = "NzMlMjUyMDY5JTI1MjA2NyUyNTIwNmUlMjUyMDYxJTI1MjA2YyUyNTIwM2ElMjUyMDIwJTI1MjA2YSUyNTIwNzUlMjUyMDZlJTI1MjA2OSUyNTIwNzAlMjUyMDY1JTI1MjA3MiUyNTIwMmQlMjUyMDZkJTI1MjA2MSUyNTIwNmUlMjUyMDc0JTI1MjA2MSUyNTIwMmQlMjUyMDM0JTI1MjAzNiUyNTIwMzMlMjUyMDIxJTI1MjAwYQ==";
const fourLayer = deterministicRecipeChain(fourLayerInput, 10);
assert.deepEqual(fourLayer.steps.map((step) => step.op), ["From Base64", "URL Decode", "URL Decode", "From Hex"]);
assert.equal(fourLayer.output, "signal: juniper-manta-463!\n");

console.log(`Cyber Workbench triage evaluation passed (${cases.length} recipe cases, 9 file-safety checks, 3 layered chains).`);
