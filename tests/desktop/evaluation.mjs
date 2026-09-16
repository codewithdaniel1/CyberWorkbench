import assert from "node:assert/strict";
import { evaluationCases, quickEvaluationCases, scoreAgentRun, scoreModelResponse, scorecardSummary } from "../../desktop/evaluation.mjs";

const byId = (id) => evaluationCases.find((evaluationCase) => evaluationCase.id === id);
const base64 = scoreAgentRun(["From Base64"], "Cyber Workbench: ocelot-741\n", byId("base64"));
const layered = scoreAgentRun(["From Base64", "URL Decode", "URL Decode", "From Hex"], "signal: juniper-manta-463\n", byId("layered"));
const wrongOrder = scoreAgentRun(["From Hex", "From Base64", "URL Decode", "URL Decode"], "signal: juniper-manta-463\n", byId("layered"));
const abstain = scoreAgentRun([], byId("abstain").input, byId("abstain"));
const speculative = scoreAgentRun(["From Base64"], "", byId("abstain"));
const modelBase64 = scoreModelResponse({ classification: "base64", recipe: [{ operation: "From Base64", args: [] }] }, byId("base64"));
const modelAbstain = scoreModelResponse({ classification: "plain", recipe: [] }, byId("abstain"));

assert.equal(base64.passed, true);
assert.equal(layered.passed, true);
assert.equal(wrongOrder.passed, false);
assert.equal(abstain.safeAbstention, true);
assert.equal(speculative.safeAbstention, false);
assert.equal(base64.outputMatch, true);
assert.equal(modelBase64.passed, true);
assert.equal(modelAbstain.safeAbstention, true);
assert.deepEqual(byId("layered").expectedOperations, ["From Base64", "URL Decode", "URL Decode", "From Hex"]);
assert.deepEqual(byId("gzip").expectedOperations, ["From Base64", "Gunzip"]);
assert.deepEqual(quickEvaluationCases.map((evaluationCase) => evaluationCase.id), ["base64", "layered", "gzip", "jwt", "aes"]);
assert.deepEqual(scorecardSummary([
    { evaluationCase: byId("base64"), score: base64, latencyMs: 100 },
    { evaluationCase: byId("layered"), score: layered, latencyMs: 200 },
    { evaluationCase: byId("abstain"), score: abstain, latencyMs: 300 },
]), { passed: 3, exactRecipes: 3, abstentions: 1, abstentionTotal: 1, outputMatches: 3, outputTotal: 3, classifications: 0, classificationTotal: 0, latency: 600, total: 3 });

console.log("Cyber Workbench agent-scorecard evaluation passed (11 scoring checks).");
