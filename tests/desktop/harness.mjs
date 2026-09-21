import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Chef from "../../src/core/Chef.mjs";
import config from "../../src/core/config/OperationConfig.json" with { type: "json" };
import { asText } from "../../desktop/agent.mjs";
import { buildOperationCatalog, retrieveOperations } from "../../desktop/catalog.mjs";
import { evaluationCases, scoreAgentRun } from "../../desktop/evaluation.mjs";
import { searchHarness } from "../../desktop/harness.mjs";
import { resolveOperationArguments } from "../../desktop/operationArgs.mjs";

const catalog = buildOperationCatalog(config);
assert.equal(catalog.length, Object.keys(config).length);
assert.equal(catalog.filter((entry) => entry.errors.length).length, 0, "all live operation defaults must validate");
assert.equal(catalog.some((item) => item.name === "From HTML Entity"), true);
assert.equal(retrieveOperations(catalog, "ticket&#x3A; amber&#x2D;617").candidates[0].name, "From HTML Entity");
assert.equal(retrieveOperations(catalog, "ciphertext", { goal: "ROT13" }).candidates[0].name, "ROT13");
assert.equal(retrieveOperations(catalog, "data").blocked.some((entry) => entry.name === "AES Decrypt" && entry.reason.includes("Key")), true);

const aes = resolveOperationArguments(config["AES Decrypt"].args);
assert.deepEqual(aes.args[0], { option: "Hex", string: "" });
assert.deepEqual(aes.missing.slice(0, 2), ["Key", "IV"]);
const blockedGoal = await searchHarness({ input: "ciphertext", catalog, bake: async () => {
    throw new Error("should not execute");
}, goal: "AES Decrypt" });
assert.deepEqual(blockedGoal.recipe, []);
assert.equal(blockedGoal.trials, 0);
assert.match(blockedGoal.stopReason, /requires Key, IV/);
const changed = resolveOperationArguments([{ name: "Mode", type: "editableOption", value: [{ value: "first" }, { value: "second" }], defaultIndex: 1 }]);
assert.deepEqual(changed.args, ["second"]);

const bake = async (input, recipe) => {
    const result = await new Chef().bake(input, recipe);
    if (result.error) throw new Error(result.error.displayStr);
    return result.dish.value;
};
for (const name of ["test1file", "test2file", "test3file", "test5file"]) {
    const input = (await readFile(new URL(`../../examples/triage/${name}`, import.meta.url), "utf8")).trim();
    const result = await searchHarness({ input, catalog, bake });
    assert.equal(result.catalogTotal, catalog.length, `${name}: full catalog was used`);
    if (name === "test5file") {
        assert.deepEqual(result.recipe, [], `${name}: plain text stays untouched`);
        continue;
    }
    const expected = name === "test1file" ? ["From Base64", "URL Decode", "From Hex"] :
        name === "test2file" ? ["From Base64", "Gunzip"] : ["URL Decode", "URL Decode", "From Hex"];
    assert.deepEqual(result.recipe.map((step) => step.op), expected, `${name}: runnable recipe`);
}

for (const evaluationCase of evaluationCases) {
    const solved = await searchHarness({ input: evaluationCase.input, catalog, bake });
    assert.equal(scoreAgentRun(solved.recipe.map((step) => step.op), asText(solved.current), evaluationCase).passed, true,
        `${evaluationCase.id}: expected a runnable exact recipe and output, got ${solved.recipe.map((step) => step.op).join(" → ")}`);
    assert.ok(solved.trials <= 10, `${evaluationCase.id}: trial budget`);
}

// A wrong first branch must leave the original state available for another
// candidate. This tests the search itself, not a hard-coded format detector.
const branchCatalog = buildOperationCatalog({
    "Decode A": { args: [], inputType: "string", outputType: "string", description: "First possible decode" },
    "Decode B": { args: [], inputType: "string", outputType: "string", description: "Second possible decode" }
});
const branch = await searchHarness({
    input: "ciphertext",
    catalog: branchCatalog,
    bake: async (_input, recipe) => recipe[0].op === "Decode A" ? Uint8Array.from([0, 255]) : "secret note: solved",
    judge: async (_before, step) => ({ decision: step.op === "Decode A" ? "rollback" : "solved" }),
    limits: { maxTrials: 3, maxSteps: 2, maxBytes: 1048576 }
});
assert.deepEqual(branch.recipe.map((step) => step.op), ["Decode B"]);
assert.equal(branch.trials, 2);

console.log("Cyber Workbench full-catalog harness evaluation passed.");
