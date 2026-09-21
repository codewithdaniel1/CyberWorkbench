import assert from "node:assert/strict";
import operationConfig from "../../src/core/config/OperationConfig.json" with { type: "json" };
import { CRYPTO_RAG_VERSION, cryptoKnowledgeCards, formatCryptoKnowledge, retrieveCryptoKnowledge } from "../../desktop/cryptoRag.mjs";

assert.match(CRYPTO_RAG_VERSION, /^\d{4}\.\d{2}\.\d+$/);
assert.ok(cryptoKnowledgeCards.length >= 10);
assert.deepEqual([...new Set(cryptoKnowledgeCards.flatMap((card) => card.operations).filter((name) => !operationConfig[name]))], []);

const jwt = retrieveCryptoKnowledge({
    input: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJsb2NhbCJ9.",
    candidates: [{ name: "JWT Decode" }]
});
assert.equal(jwt[0].id, "jwt-safety");
assert.match(formatCryptoKnowledge(jwt), /does not establish authenticity/i);

const aes = retrieveCryptoKnowledge({ goal: "AES decrypt with a passphrase", candidates: [{ name: "AES Decrypt" }] });
assert.ok(aes.some((card) => card.id === "symmetric-prerequisites"));
assert.match(formatCryptoKnowledge(aes), /Do not invent keys/i);

const privateKey = retrieveCryptoKnowledge({ goal: "decrypt this with a private key" });
assert.ok(privateKey.some((card) => card.id === "public-key-and-pgp"));

const hash = retrieveCryptoKnowledge({ input: "d41d8cd98f00b204e9800998ecf8427e" });
assert.ok(hash.some((card) => card.id === "hashes-are-one-way"));
assert.match(formatCryptoKnowledge(hash), /one-way/i);

const layered = retrieveCryptoKnowledge({ input: "7369676e616c3a206c6f63616c0a", candidates: [{ name: "From Hex" }] });
assert.equal(layered[0].id, "layered-encodings");

assert.equal(retrieveCryptoKnowledge({ input: "ordinary prose with no specialist indicators" }).length, 0);
console.log("Cyber Workbench cryptography RAG tests passed.");
