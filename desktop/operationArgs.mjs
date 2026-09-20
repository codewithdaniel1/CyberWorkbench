/**
 * Materialise CyberChef's UI defaults for a recipe step. The background
 * worker receives a plain recipe object, so omitted arguments are not filled
 * in automatically as they are when a user drags an operation into Chef.
 */
export function operationArguments(argumentDefinitions = [], provided = []) {
    return argumentDefinitions.map((definition, index) => {
        if (index < provided.length) return provided[index];
        if (Array.isArray(definition?.value)) {
            const first = definition.value[0];
            return first && typeof first === "object" ? first.value : first;
        }
        return definition?.value;
    });
}
