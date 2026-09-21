import { asText, outputFacts, verifiedNextStep } from "./agent.mjs";
import { resolveOperationArguments } from "./operationArgs.mjs";

function plainText(html) {
    return String(html || "").replace(/<[^>]*>/g, " ").replace(/&[^;\s]+;/g, " ").replace(/\s+/g, " ").trim();
}

function terms(value) {
    return new Set(String(value || "").toLowerCase().match(/[a-z][a-z0-9]{2,}/g) || []);
}

/** Index every operation exposed by this exact CyberChef build. */
export function buildOperationCatalog(operations) {
    return Object.entries(operations || {}).map(([name, config]) => {
        const argumentsResult = resolveOperationArguments(config.args || []);
        return {
            name,
            description: plainText(config.description),
            inputType: config.inputType,
            outputType: config.outputType,
            definitions: config.args || [],
            defaultArgs: argumentsResult.args,
            missing: argumentsResult.missing,
            errors: argumentsResult.errors,
            flowControl: Boolean(config.flowControl),
            manualBake: Boolean(config.manualBake)
        };
    });
}

function scoreOperation(entry, data, query, verified) {
    const name = entry.name.toLowerCase();
    const description = entry.description.toLowerCase();
    let score = 0;
    if (verified?.op === entry.name) score += 1000;
    if (query && name === query) score += 150;
    for (const word of terms(query)) {
        if (name.includes(word)) score += 30;
        else if (description.includes(word)) score += 3;
    }
    if (/%[0-9a-f]{2}/i.test(data) && name === "url decode") score += 100;
    if (/&#(?:x[0-9a-f]+|\d+);/i.test(data) && name === "from html entity") score += 100;
    if (/^[a-z0-9+/\s]+={1,2}$/i.test(data.trim()) && name === "from base64") score += 80;
    if (name === "from base64") {
        const compact = data.trim().replace(/\s/g, "");
        if (compact.length >= 20 && /^[a-z0-9+/]+={0,2}$/i.test(compact)) {
            try {
                const decoded = atob(compact);
                if (/%[0-9a-f]{2}/i.test(decoded) || /^(?:[0-9a-f]{2}\s*)+$/i.test(decoded) || decoded.startsWith("\x1f\x8b") ||
                    (decoded.length >= 16 && /^[a-z0-9+/]+={1,2}$/i.test(decoded) && decoded.length % 4 === 0)) score += 120;
            } catch {
                // Alphabet alone is not sufficient evidence of Base64.
            }
        }
    }
    if (/^(?:[0-9a-f]{2}\s*)+$/i.test(data.trim()) && name === "from hex") score += 80;
    if (/^[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]*$/i.test(data.trim()) && name === "jwt decode") score += 75;
    if (name === "rot13" && !query) score += 8;
    if (/^(?:from |decode |decrypt |gunzip|unzip|extract |parse )/.test(name)) score += 6;
    if (!query && /^(?:disassemble |analyse |analyze |magic|from base$)/.test(name)) score -= 12;
    if (!query && /^(?:to |encode |encrypt |generate |create |hash )/.test(name)) score -= 20;
    return score;
}

/** A bounded shortlist from the complete catalog, with an explicit reason for each exclusion. */
export function retrieveOperations(catalog, value, { goal = "", excluded = new Set(), limit = 18 } = {}) {
    const data = asText(value).slice(0, 4096);
    const facts = outputFacts(value);
    const verified = verifiedNextStep(value);
    const query = goal.toLowerCase().trim();
    const eligible = [];
    const blocked = [];
    for (const entry of catalog) {
        if (excluded.has(entry.name)) continue;
        const reason = entry.flowControl ? "requires recipe control flow" :
            entry.manualBake ? "requires manual execution" :
                entry.errors.length ? entry.errors.join(" ") :
                    entry.missing.length ? `requires ${entry.missing.join(", ")}` : "";
        if (reason) {
            blocked.push({ name: entry.name, reason });
            continue;
        }
        const score = scoreOperation(entry, data, query, verified) +
            (facts.type === "Text data" && entry.inputType === "string" ? 2 : 0) +
            (facts.type !== "Text data" && entry.inputType === "byteArray" ? 2 : 0);
        eligible.push({ ...entry, score });
    }
    eligible.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    return { candidates: eligible.slice(0, limit), blocked, total: catalog.length, eligibleCount: eligible.length, verified };
}
