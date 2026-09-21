/**
 * Versioned, local-only knowledge for CyberChef planning. These cards are
 * advisory: CyberChef's live operation definitions and temporary execution
 * remain the authority for a recipe.
 */
export const CRYPTO_RAG_VERSION = "2026.09.1";

export const cryptoKnowledgeCards = [
    {
        id: "layered-encodings",
        title: "Layered text encodings",
        tags: ["base64", "hex", "url", "percent", "html", "entity", "encoding", "layer"],
        operations: ["From Base64", "From Hex", "URL Decode", "From HTML Entity"],
        indicators: [/%[0-9a-f]{2}/i, /&#(?:x[0-9a-f]+|\d+);/i, /^(?:[0-9a-f]{2}\s*)+$/i, /^[a-z0-9+/\s]+={1,2}$/i],
        guidance: "Decode one evidenced layer at a time and inspect the actual temporary output before adding another step. Do not decode a usable URL's nested query values without evidence."
    },
    {
        id: "compressed-data",
        title: "Compression and archive layers",
        tags: ["gzip", "gunzip", "zip", "archive", "compression", "magic bytes"],
        operations: ["Gunzip", "Unzip", "Raw Inflate", "Zlib Inflate"],
        indicators: [/^H4sI/, /\x1f\x8b/],
        guidance: "Only decompress after a file signature or a successful preceding decode establishes the format. Bound output size because decompression can expand data substantially."
    },
    {
        id: "jwt-safety",
        title: "JWT decoding is not signature verification",
        tags: ["jwt", "jws", "jwe", "bearer", "token", "signature", "verify"],
        operations: ["JWT Decode"],
        indicators: [/^[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]*$/i],
        guidance: "JWT Decode exposes header and payload only. It does not establish authenticity, integrity, expiry validity, or authorization. Never accept alg=none or claim verification from decoding alone."
    },
    {
        id: "symmetric-prerequisites",
        title: "Symmetric encryption prerequisites",
        tags: ["aes", "des", "triple des", "chacha", "ascon", "cipher", "cbc", "gcm", "ctr", "ecb", "iv", "nonce", "padding"],
        operations: ["AES Decrypt", "AES Encrypt", "ChaCha", "DES Decrypt", "Triple DES Decrypt"],
        indicators: [],
        guidance: "Decryption requires a known algorithm, mode, correctly encoded key, and often an IV or nonce. Do not invent keys, IVs, modes, padding, or plaintext. AEAD modes also require a valid authentication tag and associated data when used."
    },
    {
        id: "password-and-kdf",
        title: "Passwords, salts, and key derivation",
        tags: ["password", "passphrase", "salt", "pbkdf2", "scrypt", "argon", "kdf", "derive key"],
        operations: ["Derive PBKDF2 key", "Scrypt"],
        indicators: [],
        guidance: "A salt is not a secret and cannot replace a password. Record the exact KDF, salt, iteration or work factor, output length, and input encodings before deriving a key."
    },
    {
        id: "hashes-are-one-way",
        title: "Hashes are not decodable",
        tags: ["hash", "sha", "md5", "sha1", "sha2", "sha3", "digest", "checksum"],
        operations: ["MD5", "SHA1", "SHA2", "SHA3", "BLAKE2b"],
        indicators: [/^[a-f0-9]{32}$/i, /^[a-f0-9]{40}$/i, /^[a-f0-9]{64}$/i],
        guidance: "Hash functions are one-way. Identify or calculate a digest for comparison; do not propose a decode operation or claim recovery of original plaintext."
    },
    {
        id: "public-key-and-pgp",
        title: "Public-key encryption and PGP",
        tags: ["pgp", "gpg", "rsa", "ec", "ecc", "private key", "public key", "certificate", "pem", "openpgp"],
        operations: ["PGP Decrypt", "RSA Decrypt", "PEM to JWK"],
        indicators: [/-----BEGIN PGP /, /-----BEGIN (?:RSA )?PRIVATE KEY-----/],
        guidance: "Decryption requires the matching private key and, where applicable, its passphrase. Parsing a key or certificate does not decrypt payloads or verify trust."
    },
    {
        id: "xor-analysis",
        title: "XOR needs evidence",
        tags: ["xor", "key", "crib", "repeating key", "brute force"],
        operations: ["XOR", "XOR Brute Force"],
        indicators: [],
        guidance: "Use XOR only with evidence such as a supplied key, known plaintext structure, or a deliberately bounded brute-force space. Validate candidate plaintexts; readable-looking output alone is not proof."
    },
    {
        id: "classical-ciphers",
        title: "Classical cipher transforms",
        tags: ["rot13", "caesar", "vigenere", "substitution", "classical cipher"],
        operations: ["ROT13", "Caesar Box Cipher", "Vigenère Decode"],
        indicators: [],
        guidance: "Use a classical-cipher transform only when the text pattern supports it. Preserve the original data and treat a readable result as a hypothesis until context confirms it."
    },
    {
        id: "signatures-versus-encryption",
        title: "Signatures, MACs, and encryption are different",
        tags: ["hmac", "mac", "signature", "verify", "authentication", "integrity", "encrypt", "decrypt"],
        operations: ["HMAC", "RSA Verify"],
        indicators: [],
        guidance: "Encryption provides confidentiality; signatures and MACs provide integrity or authenticity when verified with the correct key. Do not treat successful parsing or decoding as successful verification."
    }
];

function words(value) {
    return new Set(String(value || "").toLowerCase().match(/[a-z][a-z0-9-]{1,}/g) || []);
}

function operationNames(items) {
    return items.map((item) => typeof item === "string" ? item : item?.name || item?.op || item?.operation || "").filter(Boolean);
}

function matchesTag(query, tag) {
    return String(tag).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).every((word) => query.has(word));
}

/** Retrieve a compact set of cards without calling a model or external service. */
export function retrieveCryptoKnowledge({ input = "", goal = "", candidates = [], recipe = [], limit = 4 } = {}) {
    const text = String(input || "").slice(0, 50000);
    const candidateNames = operationNames(candidates);
    const recipeNames = operationNames(recipe);
    const query = words(`${goal} ${candidateNames.join(" ")} ${recipeNames.join(" ")}`);
    return cryptoKnowledgeCards.map((card) => {
        let score = 0;
        for (const tag of card.tags) {
            if (matchesTag(query, tag)) score += 18;
        }
        for (const operation of card.operations) {
            if (candidateNames.includes(operation) || recipeNames.includes(operation)) score += 24;
        }
        for (const indicator of card.indicators) {
            if (indicator.test(text.trim())) score += 80;
        }
        return { ...card, score };
    }).filter((card) => card.score > 0)
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
        .slice(0, limit);
}

export function formatCryptoKnowledge(cards) {
    if (!cards.length) return "No specialized local cryptography card matched this layer.";
    return cards.map((card) => `- [${card.id}] ${card.guidance} Relevant CyberChef operations: ${card.operations.join(", ")}.`).join("\n");
}
