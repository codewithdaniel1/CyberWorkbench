const INPUT_TYPES = new Set([
    "string", "shortString", "binaryString", "binaryShortString", "text",
    "byteArray", "editableOption", "editableOptionShort", "option",
    "argSelector", "populateOption", "populateMultiOption", "label",
    "number", "boolean", "toggleString"
]);
const REQUIRED_VALUE = /\b(?:key|iv|nonce|passphrase|password|private key|secret)\b/i;

function defaultValue(definition) {
    const { type, value, defaultIndex = 0 } = definition;
    if (type === "label") return "";
    if (type === "toggleString") return value && typeof value === "object" ? value : { option: definition.toggleValues?.[0] || "UTF8", string: value || "" };
    if (type === "boolean") return value === true || value === "true";
    if (type === "number" && value !== "" && value !== undefined) return Number(value);
    if (Array.isArray(value)) {
        const selected = value[defaultIndex] ?? value[0];
        if (type === "argSelector" || type === "populateOption" || type === "populateMultiOption") return selected?.name || "";
        return selected && typeof selected === "object" ? selected.value : selected;
    }
    return value ?? "";
}

function validValue(definition, value) {
    if (definition.type === "boolean") return typeof value === "boolean";
    if (definition.type === "number") return typeof value === "number" && Number.isFinite(value) &&
        (typeof definition.min !== "number" || value >= definition.min) &&
        (typeof definition.max !== "number" || value <= definition.max);
    if (definition.type === "toggleString") return value && typeof value === "object" &&
        definition.toggleValues?.includes(value.option) && typeof value.string === "string";
    if (typeof value !== "string") return false;
    if (definition.type === "option") return definition.value.includes(value);
    if (definition.type === "argSelector" || definition.type === "populateOption" || definition.type === "populateMultiOption") {
        return definition.value.some((item) => item.name === value);
    }
    return true;
}

/** Resolve a worker recipe's arguments using the same defaults as Chef's controls. */
export function resolveOperationArguments(definitions = [], provided = []) {
    const errors = [];
    const missing = [];
    if (!Array.isArray(provided) || provided.length > definitions.length) errors.push("Unexpected number of arguments.");
    const args = definitions.map((definition, index) => {
        if (!INPUT_TYPES.has(definition.type)) errors.push(`Unsupported argument type: ${definition.type}.`);
        const value = index < provided.length ? provided[index] : defaultValue(definition);
        if (!validValue(definition, value)) errors.push(`Invalid ${definition.name || `argument ${index + 1}`}.`);
        const content = definition.type === "toggleString" ? value?.string : value;
        if (REQUIRED_VALUE.test(definition.name || "") && typeof content === "string" && !content.trim()) {
            missing.push(definition.name);
        }
        return value;
    });
    return { args, errors, missing };
}

export function operationArguments(definitions = [], provided = []) {
    return resolveOperationArguments(definitions, provided).args;
}
