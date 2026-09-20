import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { AGENT_LIMITS, asText, isLikelyPlainText, isReadableTerminal, outputFacts, verifiedNextStep } from "../../desktop/agent.mjs";

assert.equal(verifiedNextStep("d2hhdHMgdXA=").op, "From Base64");
assert.equal(verifiedNextStep("43 79 62 65 72").op, "From Hex");
assert.equal(verifiedNextStep("https%3A%2F%2Fexample.invalid").op, "URL Decode");
assert.equal(verifiedNextStep("eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIn0.").op, "JWT Decode");
assert.equal(verifiedNextStep(Uint8Array.from([0x1f, 0x8b, 0x08]).buffer).op, "Gunzip");
assert.equal(isReadableTerminal("Cyber Workbench\n"), true);
assert.equal(isReadableTerminal(Uint8Array.from([0, 1, 2]).buffer), false);
const test5file = (await readFile(new URL("../../examples/triage/test5file", import.meta.url), "utf8")).trim();
assert.equal(isLikelyPlainText(test5file), true);
assert.equal(isLikelyPlainText("Frperg abgr: yvzr-jera-804."), false);
assert.equal(isLikelyPlainText("d2hhdHMgdXA="), false);
assert.equal(asText("hello"), "hello");
assert.equal(asText([67, 121, 98, 101, 114]), "Cyber");
assert.equal(asText(vm.runInNewContext("new Uint8Array([67, 121, 98, 101, 114]).buffer")), "Cyber");
assert.equal(outputFacts("hello").type, "Text data");
assert.deepEqual(AGENT_LIMITS, { maxSteps: 10, maxTrials: 10, operationMs: 10000, maxBytes: 1048576 });

console.log("Cyber Workbench agent helper tests passed (15 checks).");
