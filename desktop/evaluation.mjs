export const evaluationCases = [
    {
        id: "base64",
        label: "Whitespace-padded Base64",
        input: "Q3liZXIgV29ya2JlbmNo\nOiBvY2Vsb3QtNzQxCg==",
        expectedOperations: ["From Base64"],
        expectedOutput: "Cyber Workbench: ocelot-741\n",
        expectedClassification: "base64",
        rationale: "Valid Base64 may contain harmless whitespace; it should decode once."
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
        rationale: "Whitespace-tolerant Base64 yields a gzip stream."
    },
    {
        id: "jwt",
        label: "JWT-like token with metadata",
        input: "eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwia2lkIjoibG9jYWwtNzIifQ.eyJzdWIiOiJzeW50aGV0aWMtZW1iZXItd3Jlbi02MDYiLCJzY29wZSI6InJlYWQ6bG9jYWwiLCJub25jZSI6InE3bSJ9.",
        expectedOperations: ["JWT Decode"],
        expectedClassification: "jwt",
        rationale: "Three dot-separated Base64URL components form a synthetic JWT-like token."
    },
    {
        id: "abstain",
        label: "Ordinary prose with code-like text",
        input: "Operator note: route=local; ticket CAFE-741 remains open. Do not transform this sentence.",
        expectedOperations: [],
        expectedOutput: "Operator note: route=local; ticket CAFE-741 remains open. Do not transform this sentence.",
        expectedClassification: "plain",
        rationale: "Plain prose containing code-like fragments should not receive a speculative transformation."
    },
    {
        id: "ambiguous",
        label: "Ambiguous unpadded alphabet",
        input: "cafe",
        expectedOperations: [],
        expectedOutput: "cafe",
        expectedClassification: "ambiguous",
        rationale: "A common unpadded word must not be treated as high-confidence Base64."
    },
    {
        id: "malformed-url",
        label: "Malformed percent encoding",
        input: "record%2Gfinal%",
        expectedOperations: [],
        expectedOutput: "record%2Gfinal%",
        expectedClassification: "malformed",
        rationale: "Malformed percent escapes are insufficient evidence for a safe decode."
    },
    {
        id: "rot13",
        label: "ROT13 ciphertext",
        input: "Frperg abgr: yvzr-jera-804.",
        expectedOperations: ["ROT13"],
        expectedOutput: "Secret note: lime-wren-804.",
        expectedClassification: "rot13",
        rationale: "A short synthetic ROT13 message is a common low-risk classical-cipher triage case."
    },
    {
        id: "xor",
        label: "XOR envelope with declared key",
        input: "XOR-KEY=UTF8:orchid\nCIPHERTEXT-HEX: 2c 17 0f 01 0b 07",
        expectedOperations: [],
        expectedClassification: "xor",
        rationale: "Recognize the declared XOR material, but abstain because the scorecard does not supply a validated argument schema."
    },
    {
        id: "aes",
        label: "AES-CBC envelope without key",
        input: "AES-256-CBC\nIV=00112233445566778899aabbccddeeff\nCIPHERTEXT=9f86d081884c7d659a2feaa0c55ad015",
        expectedOperations: [],
        expectedClassification: "aes",
        rationale: "Recognize AES metadata and safely abstain when no key is supplied."
    },
    {
        id: "hash",
        label: "SHA-256 digest",
        input: "SHA-256: 53f0c4a7e17da9f4e42e7d2c0894c9733a24a4a6b0d18d8e32ae559d076a84a2",
        expectedOperations: [],
        expectedClassification: "hash",
        rationale: "Recognize a one-way digest and do not suggest decoding or reversing it."
    },
    {
        id: "pgp",
        label: "PGP-armored encrypted message",
        input: "-----BEGIN PGP MESSAGE-----\nVersion: Cyber Workbench synthetic fixture\n\nhQEMA7syntheticlocalonlyAAQf\n-----END PGP MESSAGE-----",
        expectedOperations: [],
        expectedClassification: "pgp",
        rationale: "Recognize PGP armor and abstain when no private key or passphrase is provided."
    }
];

export function parseModelJson(text) {
    const cleaned = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(cleaned);
}

export function scoreAgentRun(operations, output, evaluationCase) {
    const expected = evaluationCase.expectedOperations;
    const recipeMatch = operations.length === expected.length && operations.every((operation, index) => operation === expected[index]);
    const safeAbstention = expected.length === 0 ? operations.length === 0 : null;
    const outputMatch = typeof evaluationCase.expectedOutput === "string" ? output === evaluationCase.expectedOutput : null;
    return { operations, recipeMatch, safeAbstention, classification: "", classificationMatch: null, outputMatch, passed: recipeMatch && (outputMatch !== false) };
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
    const safeAbstention = expected.length === 0 ? operations.length === 0 : null;
    const classification = typeof modelResult?.classification === "string" ? modelResult.classification.trim().toLowerCase() : "";
    const expectedClassification = evaluationCase.expectedClassification || "";
    const classificationMatch = expectedClassification ? classification === expectedClassification : null;
    return { operations, recipeMatch, safeAbstention, classification, classificationMatch, outputMatch: null, passed: recipeMatch && classificationMatch !== false };
}

export function scorecardSummary(results) {
    const passed = results.filter((result) => result.score.passed).length;
    const exactRecipes = results.filter((result) => result.score.recipeMatch).length;
    const abstentions = results.filter((result) => result.evaluationCase.expectedOperations.length === 0 && result.score.safeAbstention).length;
    const abstentionTotal = results.filter((result) => result.evaluationCase.expectedOperations.length === 0).length;
    const outputMatches = results.filter((result) => result.score.outputMatch === true).length;
    const outputTotal = results.filter((result) => result.score.outputMatch !== null).length;
    const classifications = results.filter((result) => result.score.classificationMatch === true).length;
    const classificationTotal = results.filter((result) => typeof result.score.classificationMatch === "boolean").length;
    const latency = results.reduce((total, result) => total + result.latencyMs, 0);
    return { passed, exactRecipes, abstentions, abstentionTotal, outputMatches, outputTotal, classifications, classificationTotal, latency, total: results.length };
}
