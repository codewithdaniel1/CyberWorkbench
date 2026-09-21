/**
 * Deterministic planner fixtures. Every scorecard case has an executable
 * CyberChef recipe and a known final value; non-actionable inputs belong in
 * safety/regression tests, not a recipe-planning scorecard.
 */
export const evaluationCases = [
    {
        id: "base64",
        label: "Whitespace-padded Base64",
        input: "Q3liZXIgV29ya2JlbmNo\nOiBvY2Vsb3QtNzQxCg==",
        expectedOperations: ["From Base64"],
        expectedOutput: "Cyber Workbench: ocelot-741\n",
        expectedClassification: "base64",
        quick: true,
        rationale: "Valid Base64 may contain harmless whitespace; decode it once."
    },
    {
        id: "hex",
        label: "Compact hexadecimal bytes",
        input: "776f726b62656e63683a2073616666726f6e2d726176656e2d3831320a",
        expectedOperations: ["From Hex"],
        expectedOutput: "workbench: saffron-raven-812\n",
        expectedClassification: "hex",
        rationale: "A compact even-length hexadecimal string should decode once."
    },
    {
        id: "url",
        label: "Encoded URL with nested value",
        input: "https%3A%2F%2Fexample.invalid%2Flookup%3Ftag%3Dcedar%2520fox",
        expectedOperations: ["URL Decode"],
        expectedOutput: "https://example.invalid/lookup?tag=cedar%20fox",
        expectedClassification: "url",
        rationale: "Decode the outer URL layer without speculatively decoding the nested value."
    },
    {
        id: "layered",
        label: "Base64 → URL → URL → Hex",
        input: "NzMlMjUyMDY5JTI1MjA2NyUyNTIwNmUlMjUyMDYxJTI1MjA2YyUyNTIwM2ElMjUyMDIwJTI1MjA2YSUyNTIwNzUlMjUyMDZlJTI1MjA2OSUyNTIwNzAlMjUyMDY1JTI1MjA3MiUyNTIwMmQlMjUyMDZkJTI1MjA2MSUyNTIwNmUlMjUyMDc0JTI1MjA2MSUyNTIwMmQlMjUyMDM0JTI1MjAzNiUyNTIwMzMlMjUyMDBh",
        expectedOperations: ["From Base64", "URL Decode", "URL Decode", "From Hex"],
        expectedOutput: "signal: juniper-manta-463\n",
        expectedClassification: "layered encoding",
        quick: true,
        rationale: "Base64 reveals two percent-encoding layers before compact hexadecimal text."
    },
    {
        id: "double-url",
        label: "URL → URL → Hex with punctuation",
        input: "70%252061%252063%25206b%252065%252074%25203a%252020%25206d%25206f%252073%252073%25202d%25206f%252074%252074%252065%252072%25202d%252034%252036%25200a",
        expectedOperations: ["URL Decode", "URL Decode", "From Hex"],
        expectedOutput: "packet: moss-otter-46\n",
        expectedClassification: "layered encoding",
        rationale: "Two percent-decoding passes reveal hexadecimal byte pairs containing punctuation."
    },
    {
        id: "gzip",
        label: "Whitespace-padded Base64 → Gunzip",
        input: "H4sIAAAAAAAAE0ssSs7ILEvVzcsvSbVS\nKEvNKUst0c0vKUkt0jUyMOUCANmfDbwfAAAA",
        expectedOperations: ["From Base64", "Gunzip"],
        expectedOutput: "archive-note: velvet-otter-205\n",
        expectedClassification: "gzip",
        quick: true,
        rationale: "Whitespace-tolerant Base64 yields a gzip stream."
    },
    {
        id: "rot13",
        label: "ROT13 ciphertext",
        input: "Frperg abgr: yvzr-jera-804.",
        expectedOperations: ["ROT13"],
        expectedOutput: "Secret note: lime-wren-804.",
        expectedClassification: "rot13",
        quick: true,
        rationale: "A synthetic ROT13 message is a low-risk classical-cipher transform."
    },
    {
        id: "base64-hex",
        label: "Base64 → Hex",
        input: "NmI2NTc5M2EyMDY5NzY2ZjcyNzkyZDM3MzMzNjBh",
        expectedOperations: ["From Base64", "From Hex"],
        expectedOutput: "key: ivory-736\n",
        expectedClassification: "layered encoding",
        rationale: "The Base64 layer resolves to an even-length hexadecimal byte string."
    },
    {
        id: "url-base64",
        label: "URL → Base64",
        input: "YWxlcnQ6IGNvcmFsLTU5Mgo%3D",
        expectedOperations: ["URL Decode", "From Base64"],
        expectedOutput: "alert: coral-592\n",
        expectedClassification: "layered encoding",
        rationale: "A single percent escape completes valid Base64 padding."
    },
    {
        id: "hex-url",
        label: "Hex-encoded URL",
        input: "68747470733a2f2f6578616d706c652e696e76616c69642f613f7461673d6d6172626c652d3438380a",
        expectedOperations: ["From Hex"],
        expectedOutput: "https://example.invalid/a?tag=marble-488\n",
        expectedClassification: "layered encoding",
        rationale: "Hex bytes resolve directly to a usable URL; an extra URL Decode would be a no-op."
    },
    {
        id: "base64-rot13",
        label: "Base64 → ROT13",
        input: "RnJwZXJnIGFiZ3I6IGxiaC01MTcuCg==",
        expectedOperations: ["From Base64", "ROT13"],
        expectedOutput: "Secret note: you-517.\n",
        expectedClassification: "layered encoding",
        rationale: "Base64 resolves to readable ROT13 ciphertext."
    },
    {
        id: "hex-base64",
        label: "Hex → Base64",
        input: "62575674627a6f6763585668636e52364c5449774f516f3d",
        expectedOperations: ["From Hex", "From Base64"],
        expectedOutput: "memo: quartz-209\n",
        expectedClassification: "layered encoding",
        rationale: "Hex resolves to a correctly padded Base64 string."
    },
    {
        id: "double-base64",
        label: "Base64 → Base64",
        input: "YkdGNVpYSTZJRzFwYm5RdE9EQXpDZz09",
        expectedOperations: ["From Base64", "From Base64"],
        expectedOutput: "layer: mint-803\n",
        expectedClassification: "layered encoding",
        rationale: "The first Base64 decode yields another valid, padded Base64 layer."
    },
    {
        id: "base64-url",
        label: "Base64 → URL",
        input: "aHR0cHMlM0ElMkYlMkZleGFtcGxlLmludmFsaWQlMkZub3RlJTNGaWQlM0Rvbnl4LTMxNA==",
        expectedOperations: ["From Base64", "URL Decode"],
        expectedOutput: "https://example.invalid/note?id=onyx-314",
        expectedClassification: "layered encoding",
        rationale: "Base64 resolves to a percent-encoded URL."
    },
    {
        id: "html-entity",
        label: "HTML entity text",
        input: "ticket&#x3A; amber&#x2D;617&#x0A;",
        expectedOperations: ["From HTML Entity"],
        expectedOutput: "ticket: amber-617\n",
        expectedClassification: "encoded text",
        rationale: "Numeric HTML entities are an explicit, deterministic text encoding."
    }
];

export const quickEvaluationCases = evaluationCases.filter((evaluationCase) => evaluationCase.quick);

export function validateEvaluationCases(cases = evaluationCases) {
    for (const evaluationCase of cases) {
        if (!Array.isArray(evaluationCase.expectedOperations) || evaluationCase.expectedOperations.length === 0) {
            throw new Error(`Scorecard case “${evaluationCase.id}” must expect at least one CyberChef operation.`);
        }
        if (typeof evaluationCase.expectedOutput !== "string") {
            throw new Error(`Scorecard case “${evaluationCase.id}” must include a concrete expected output.`);
        }
    }
    return true;
}

validateEvaluationCases();

export function parseModelJson(text) {
    const cleaned = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(cleaned);
}

export function scoreAgentRun(operations, output, evaluationCase) {
    const expected = evaluationCase.expectedOperations;
    const recipeMatch = operations.length === expected.length && operations.every((operation, index) => operation === expected[index]);
    const outputMatch = output === evaluationCase.expectedOutput;
    return { operations, recipeMatch, classification: "", classificationMatch: null, outputMatch, passed: recipeMatch && outputMatch };
}

/**
 * Grade a selected Ollama model's planned recipe. Unlike scoreAgentRun this
 * deliberately does not execute the operations: it measures the model, not
 * the deterministic CyberChef safety net.
 */
export function scoreModelResponse(modelResult, evaluationCase) {
    const operations = Array.isArray(modelResult?.recipe) ? modelResult.recipe.map((step) => typeof step?.operation === "string" ? step.operation : "").filter(Boolean) : [];
    const expected = evaluationCase.expectedOperations;
    const recipeMatch = operations.length === expected.length && operations.every((operation, index) => operation === expected[index]);
    const classification = typeof modelResult?.classification === "string" ? modelResult.classification.trim().toLowerCase() : "";
    const expectedClassification = evaluationCase.expectedClassification || "";
    const classificationMatch = expectedClassification ? classification === expectedClassification : null;
    // A scorecard pass measures whether the model selected the exact runnable
    // Chef recipe. Classification is useful diagnostic evidence, but must not
    // turn a correct recipe into a failure.
    return { operations, recipeMatch, classification, classificationMatch, outputMatch: null, passed: recipeMatch };
}

export function scorecardSummary(results) {
    const passed = results.filter((result) => result.score.passed).length;
    const exactRecipes = results.filter((result) => result.score.recipeMatch).length;
    const outputMatches = results.filter((result) => result.score.outputMatch === true).length;
    const outputTotal = results.filter((result) => result.score.outputMatch !== null).length;
    const classifications = results.filter((result) => result.score.classificationMatch === true).length;
    const classificationTotal = results.filter((result) => typeof result.score.classificationMatch === "boolean").length;
    const latency = results.reduce((total, result) => total + result.latencyMs, 0);
    return { passed, exactRecipes, outputMatches, outputTotal, classifications, classificationTotal, latency, total: results.length };
}
