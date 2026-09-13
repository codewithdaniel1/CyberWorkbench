/**
 * Pure local file-triage helpers.
 *
 * Kept free of browser UI state so that every deterministic suggestion can be
 * evaluated in Node before it is presented in Cyber Workbench.
 */

export function hexPreview(bytes, limit = 32) {
    return Array.from(bytes.slice(0, limit), (value) => value.toString(16).padStart(2, "0")).join(" ");
}

export function detectFileType(bytes) {
    const starts = (...values) => values.every((value, index) => bytes[index] === value);
    if (starts(0x25, 0x50, 0x44, 0x46)) return "PDF document";
    if (starts(0x50, 0x4b, 0x03, 0x04)) return "ZIP archive (or Office document)";
    if (starts(0x1f, 0x8b)) return "Gzip stream";
    if (starts(0x89, 0x50, 0x4e, 0x47)) return "PNG image";
    if (starts(0xff, 0xd8, 0xff)) return "JPEG image";
    if (starts(0x7f, 0x45, 0x4c, 0x46)) return "ELF executable";
    if (starts(0x4d, 0x5a)) return "Windows PE executable";
    if (starts(0x52, 0x61, 0x72, 0x21)) return "RAR archive";
    const printable = Array.from(bytes, (byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)).filter(Boolean).length;
    if (bytes.length && printable / bytes.length > .9) return "Text data";
    return "Unknown / inspect with CyberChef";
}

export function entropy(bytes) {
    if (!bytes.length) return 0;
    const counts = new Uint32Array(256);
    for (const byte of bytes) counts[byte]++;
    const value = counts.reduce((total, count) => {
        if (!count) return total;
        const probability = count / bytes.length;
        return total + probability * Math.log2(probability);
    }, 0);
    return value ? -value : 0;
}

export function safeTextPreview(bytes) {
    if (bytes.includes(0)) return "Binary content detected; text preview omitted.";
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 8192));
    return text ? text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "�") : "No printable text preview.";
}

export function chefTextInput(bytes) {
    if (bytes.includes(0)) return "";
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function deterministicRecipe(input) {
    const text = String(input || "").trim();
    if (!text) return null;
    if (/%[0-9a-f]{2}/i.test(text)) return {
        op: "URL Decode",
        args: [],
        confidence: "high",
        why: "Percent-encoded byte sequences are present in the text."
    };
    if (/^(?:[0-9a-f]{2}\s*)+$/i.test(text)) return {
        op: "From Hex",
        args: [],
        confidence: "high",
        why: "The text is a sequence of hexadecimal byte pairs."
    };
    const compact = text.replace(/\s/g, "");
    if (/^[A-Za-z0-9+/]*={1,2}$/.test(compact) && compact.length >= 4 && compact.length % 4 === 0) return {
        op: "From Base64",
        args: [],
        confidence: "high",
        why: "The text uses the Base64 alphabet, has valid padding, and has a length divisible by four."
    };
    return null;
}

function applyDeterministicStep(input, operation) {
    if (operation === "From Base64") return atob(String(input).replace(/\s/g, ""));
    if (operation === "From Hex") {
        const compact = String(input).replace(/\s/g, "");
        return String.fromCharCode(...compact.match(/.{2}/g).map((pair) => Number.parseInt(pair, 16)));
    }
    if (operation === "URL Decode") return decodeURIComponent(String(input));
    return input;
}

/**
 * Return a small, evidence-backed chain and its locally decoded text.
 * The cap prevents cyclic or speculative multi-layer suggestions.
 */
export function deterministicRecipeChain(input, limit = 3) {
    const steps = [];
    let output = String(input || "");
    for (let index = 0; index < limit; index++) {
        const step = deterministicRecipe(output);
        if (!step) break;
        try {
            const next = applyDeterministicStep(output, step.op);
            if (next === output) break;
            steps.push(step);
            output = next;
        } catch {
            break;
        }
    }
    return { steps, output };
}
