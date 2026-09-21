import { detectFileType, deterministicRecipeChain, safeTextPreview } from "./triage.mjs";

export const AGENT_LIMITS = { maxSteps: 10, maxTrials: 10, operationMs: 10000, maxBytes: 1048576 };

export function asBytes(value) {
    // Values returned from the Chef iframe belong to a different JS realm, so
    // `instanceof ArrayBuffer` is not reliable here.
    if (value instanceof ArrayBuffer || Object.prototype.toString.call(value) === "[object ArrayBuffer]") return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    // CyberChef's background worker serializes byte output as a regular array.
    // Keep it as bytes rather than turning it into comma-separated decimal text.
    if (Array.isArray(value) && value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) return Uint8Array.from(value);
    if (value && typeof value === "object") return new TextEncoder().encode(JSON.stringify(value));
    return new TextEncoder().encode(String(value || ""));
}

export function asText(value) {
    if (typeof value === "string") return value;
    return new TextDecoder("utf-8", { fatal: false }).decode(asBytes(value));
}

export function verifiedNextStep(value) {
    const text = asText(value);
    if (/&#(?:x[0-9a-f]+|\d+);/i.test(text)) return { op: "From HTML Entity", args: [], confidence: "high", why: "The text contains numeric HTML entities." };
    const deterministic = deterministicRecipeChain(text, 1).steps[0];
    if (deterministic) return deterministic;
    const type = detectFileType(asBytes(value));
    if (type === "Gzip stream") return { op: "Gunzip", args: [], confidence: "high", why: "The temporary output has the gzip signature (1f 8b)." };
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(text.trim())) return { op: "JWT Decode", args: [], confidence: "high", why: "The temporary output has three Base64URL-like JWT segments." };
    if (text.length >= 12 && /^[\x20-\x7e\r\n\t]+$/.test(text)) {
        const rotated = text.replace(/[a-z]/gi, (letter) => String.fromCharCode(letter.charCodeAt(0) + (letter.toLowerCase() <= "m" ? 13 : -13)));
        const common = /\b(?:secret|note|message|hello|the|and|this|flag)\b/gi;
        const decodedHits = rotated.match(common)?.length || 0;
        const sourceHits = text.match(common)?.length || 0;
        if (decodedHits >= 2 && decodedHits > sourceHits) return { op: "ROT13", args: [], confidence: "medium", why: "ROT13 reveals multiple common English words." };
    }
    return null;
}

export function outputFacts(value) {
    const bytes = asBytes(value);
    return {
        byteLength: bytes.byteLength,
        type: detectFileType(bytes),
        preview: safeTextPreview(bytes).slice(0, 1000)
    };
}

export function isReadableTerminal(value) {
    const bytes = asBytes(value);
    if (!bytes.length || bytes.includes(0)) return false;
    const printable = Array.from(bytes, (byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)).filter(Boolean).length;
    return printable / bytes.length > .95;
}

/**
 * A conservative terminal check for ordinary prose. It avoids wasting trial
 * operations on a normal sentence while leaving encoded-looking and cipher-
 * looking text available for the model-guided search.
 */
export function isLikelyPlainText(value) {
    const text = asText(value).trim();
    if (!isReadableTerminal(text) || text.length < 16 || verifiedNextStep(text)) return false;
    const words = text.toLowerCase().match(/[a-z]{2,}/g) || [];
    const commonWords = new Set([
        "a", "an", "and", "are", "at", "be", "but", "by", "for", "from", "here", "in", "is", "it", "local", "note", "nothing", "of", "on", "or", "plain", "text", "that", "the", "this", "to", "was", "with"
    ]);
    return words.filter((word) => commonWords.has(word)).length >= 3;
}
