import assert from "node:assert/strict";
import { evaluationCases, quickEvaluationCases, scoreAgentRun, scoreModelResponse, scorecardSummary, validateEvaluationCases } from "../../desktop/evaluation.mjs";

const byId = (id) => evaluationCases.find((evaluationCase) => evaluationCase.id === id);
const base64 = scoreAgentRun(["From Base64"], "Cyber Workbench: ocelot-741\n", byId("base64"));
const layered = scoreAgentRun(["From Base64", "URL Decode", "URL Decode", "From Hex"], "signal: juniper-manta-463\n", byId("layered"));
const wrongOrder = scoreAgentRun(["From Hex", "From Base64", "URL Decode", "URL Decode"], "signal: juniper-manta-463\n", byId("layered"));
const wrongOutput = scoreAgentRun(["From Base64", "From Hex"], "wrong", byId("base64-hex"));
const modelBase64 = scoreModelResponse({ classification: "base64", recipe: [{ operation: "From Base64", args: [] }] }, byId("base64"));
const modelLayered = scoreModelResponse({ classification: "layered encoding", recipe: [{ operation: "URL Decode", args: [] }, { operation: "From Base64", args: [] }] }, byId("url-base64"));
const modelCorrectRecipeBadClassification = scoreModelResponse({ classification: "one allowed value", recipe: [{ operation: "From Base64", args: [] }] }, byId("base64"));

assert.equal(validateEvaluationCases(), true);
assert.equal(evaluationCases.every((evaluationCase) => evaluationCase.expectedOperations.length > 0), true);
assert.equal(evaluationCases.every((evaluationCase) => typeof evaluationCase.expectedOutput === "string"), true);
assert.equal(base64.passed, true);
assert.equal(layered.passed, true);
assert.equal(wrongOrder.passed, false);
assert.equal(wrongOutput.passed, false);
assert.equal(base64.outputMatch, true);
assert.equal(modelBase64.passed, true);
assert.equal(modelLayered.passed, true);
assert.equal(modelCorrectRecipeBadClassification.passed, true);
assert.equal(modelCorrectRecipeBadClassification.classificationMatch, false);
assert.deepEqual(byId("layered").expectedOperations, ["From Base64", "URL Decode", "URL Decode", "From Hex"]);
assert.deepEqual(byId("gzip").expectedOperations, ["From Base64", "Gunzip"]);
assert.deepEqual(byId("html-entity").expectedOperations, ["From HTML Entity"]);
assert.deepEqual(quickEvaluationCases.map((evaluationCase) => evaluationCase.id), ["base64", "layered", "gzip", "rot13"]);
assert.deepEqual(scorecardSummary([
    { evaluationCase: byId("base64"), score: base64, latencyMs: 100 },
    { evaluationCase: byId("layered"), score: layered, latencyMs: 200 },
    { evaluationCase: byId("base64-hex"), score: wrongOutput, latencyMs: 300 },
]), { passed: 2, exactRecipes: 3, outputMatches: 2, outputTotal: 3, classifications: 0, classificationTotal: 0, latency: 600, total: 3 });

console.log("Cyber Workbench deterministic recipe scorecard evaluation passed (15 checks).");
