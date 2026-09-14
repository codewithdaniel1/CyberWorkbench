import { detectFileType, deterministicRecipeChain, safeTextPreview } from "./triage.mjs";

export const AGENT_LIMITS = { maxSteps: 8, maxMs: 30000, operationMs: 10000, maxBytes: 1048576 };

export function asBytes(value) {
    // Values returned from the Chef iframe belong to a different JS realm, so
    // `instanceof ArrayBuffer` is not reliable here.
    if (value instanceof ArrayBuffer || Object.prototype.toString.call(value) === "[object ArrayBuffer]") return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    // CyberChef's background worker serializes byte output as a regular array.
    // Keep it as bytes rather than turning it into comma-separated decimal text.
    if (Array.isArray(value) && value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) return Uint8Array.from(value);
    return new TextEncoder().encode(String(value || ""));
}

export function asText(value) {
    if (typeof value === "string") return value;
    return new TextDecoder("utf-8", { fatal: false }).decode(asBytes(value));
}

export function verifiedNextStep(value) {
    const text = asText(value);
    const deterministic = deterministicRecipeChain(text, 1).steps[0];
    if (deterministic) return deterministic;
    const type = detectFileType(asBytes(value));
    if (type === "Gzip stream") return { op: "Gunzip", args: [], confidence: "high", why: "The temporary output has the gzip signature (1f 8b)." };
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(text.trim())) return { op: "JWT Decode", args: [], confidence: "high", why: "The temporary output has three Base64URL-like JWT segments." };
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
