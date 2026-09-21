import { AGENT_LIMITS, asBytes, asText, isLikelyPlainText, isReadableTerminal, outputFacts, verifiedNextStep } from "./agent.mjs";
import { retrieveOperations } from "./catalog.mjs";
import { resolveOperationArguments } from "./operationArgs.mjs";

async function fingerprint(value) {
    const digest = await crypto.subtle.digest("SHA-256", asBytes(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function outputQuality(value) {
    const facts = outputFacts(value);
    const text = asText(value).slice(0, 4000);
    const verified = verifiedNextStep(value);
    let score = verified ? 30 : 0;
    if (facts.type !== "Text data" && facts.type !== "Unknown / inspect with CyberChef") score += 18;
    if (isReadableTerminal(value)) {
        score += 8;
        if (/\b(?:the|and|this|note|secret|signal|packet|alert|message|hello|https?:\/\/)\b/i.test(text)) score += 12;
        if (/^[\x20-\x7e\r\n\t]+$/.test(text)) score += 3;
        try {
            JSON.parse(text);
            score += 18;
        } catch {
            // Most useful results are not JSON.
        }
    }
    return score;
}

function orderedCandidates(candidates, choice) {
    const name = typeof choice === "string" ? choice : choice?.operation;
    const canonical = candidates.find((entry) => entry.name.toLowerCase() === String(name || "").trim().toLowerCase());
    if (!canonical) return candidates;
    const selected = { ...canonical, proposedArgs: Array.isArray(choice?.args) ? choice.args : [] };
    return [selected, ...candidates.filter((entry) => entry.name !== canonical.name)];
}

/**
 * Search bounded recipe branches using real CyberChef executions. Dependencies
 * are injected so the same engine can serve analysis and scorecard runs.
 */
export async function searchHarness({
    input, catalog, bake, choose = null, judge = null, goal = "", signal,
    onProgress = () => {}, limits = AGENT_LIMITS
}) {
    const requestedOperation = goal.trim() && catalog.find((entry) => entry.name.toLowerCase() === goal.trim().toLowerCase());
    if (requestedOperation) {
        const { blocked } = retrieveOperations(catalog, input, { goal, limit: catalog.length });
        const unavailable = blocked.find((entry) => entry.name === requestedOperation.name);
        if (unavailable) {
            return {
                recipe: [], current: input, trace: [], trials: 0, catalogTotal: catalog.length,
                stopReason: `${unavailable.name} cannot be tested automatically: ${unavailable.reason}. Provide the required parameters in Chef and review them before running.`,
                blockedOperation: unavailable.name
            };
        }
    }
    const firstHash = await fingerprint(input);
    const frontier = [{ value: input, recipe: [], score: outputQuality(input), candidates: null, hash: firstHash }];
    const seen = new Set([firstHash]);
    const trace = [];
    let best = frontier[0];
    let trials = 0;
    let stopReason = "No further safe transformation was established.";
    if (!goal && isLikelyPlainText(input)) {
        return { recipe: [], current: input, trace, trials, stopReason: "The input appears to be ordinary readable text.", catalogTotal: catalog.length };
    }
    while (frontier.length && trials < limits.maxTrials) {
        if (signal?.aborted) throw new DOMException("Temporary solve cancelled", "AbortError");
        frontier.sort((a, b) => b.score - a.score || b.recipe.length - a.recipe.length);
        const state = frontier.shift();
        if (state.recipe.length >= limits.maxSteps) continue;
        if (!state.candidates) {
            const shortlist = retrieveOperations(catalog, state.value, { goal, limit: catalog.length });
            state.candidates = shortlist.candidates;
            if (choose && !shortlist.verified && state.candidates.length) {
                onProgress(`Trial ${trials + 1}/${limits.maxTrials}: selecting from ${shortlist.total} CyberChef operations…`);
                try {
                    state.candidates = orderedCandidates(state.candidates, await choose(state.value, state.candidates.slice(0, 18), state.recipe, signal));
                } catch (error) {
                    if (error.name === "AbortError") throw error;
                    trace.push(`Model selection unavailable: ${error.message}. Trying locally ranked candidates.`);
                }
            }
        }
        const candidate = state.candidates.shift();
        if (!candidate) continue;
        if (state.candidates.length) frontier.push(state);
        const resolved = resolveOperationArguments(candidate.definitions, candidate.proposedArgs || []);
        const step = { op: candidate.name, args: resolved.args, confidence: candidate.name === verifiedNextStep(state.value)?.op ? "high" : "medium", why: candidate.description.slice(0, 180) || "Candidate from the live CyberChef catalog." };
        trials++;
        if (resolved.errors.length || resolved.missing.length) {
            trace.push(`Trial ${trials}: skipped ${step.op} — ${[...resolved.errors, ...resolved.missing.map((name) => `requires ${name}`)].join(" ")}`);
            continue;
        }
        onProgress(`Trial ${trials}/${limits.maxTrials}: testing ${step.op} in CyberChef…`);
        let next;
        try {
            next = await bake(input, [...state.recipe, step].map(({ op, args }) => ({ op, args })), signal);
        } catch (error) {
            if (error.name === "AbortError") throw error;
            trace.push(`Trial ${trials}: rejected ${step.op} — CyberChef reported ${error.message}.`);
            continue;
        }
        if (asBytes(next).byteLength > limits.maxBytes) {
            trace.push(`Trial ${trials}: rejected ${step.op} — output exceeds the ${limits.maxBytes} byte limit.`);
            continue;
        }
        if (!asBytes(next).byteLength) {
            trace.push(`Trial ${trials}: rejected ${step.op} — output is empty.`);
            continue;
        }
        const hash = await fingerprint(next);
        if (seen.has(hash)) {
            trace.push(`Trial ${trials}: rejected ${step.op} — output is unchanged or repeats an earlier result.`);
            continue;
        }
        seen.add(hash);
        const nextVerified = verifiedNextStep(next);
        let decision = "keep";
        if (!nextVerified && judge) {
            onProgress(`Trial ${trials}/${limits.maxTrials}: checking ${step.op}'s result…`);
            try {
                const verdict = await judge(state.value, step, next, state.recipe, signal);
                if (["keep", "rollback", "solved"].includes(verdict?.decision)) decision = verdict.decision;
            } catch (error) {
                if (error.name === "AbortError") throw error;
                trace.push(`Trial ${trials}: model direction check unavailable; CyberChef result retained for comparison.`);
            }
        }
        if (decision === "rollback" && !isLikelyPlainText(next) && outputQuality(next) < outputQuality(state.value)) {
            trace.push(`Trial ${trials}: rolled back ${step.op} — result did not improve.`);
            continue;
        }
        const child = {
            value: next,
            recipe: [...state.recipe, step],
            score: outputQuality(next) + state.recipe.length * 2,
            candidates: null,
            hash
        };
        trace.push(`Trial ${trials}: kept ${step.op} → ${outputFacts(next).type}, ${asBytes(next).byteLength} bytes${nextVerified ? `; next verified layer: ${nextVerified.op}` : ""}.`);
        if (child.score > best.score || !best.recipe.length) best = child;
        // A usable URL can intentionally contain percent escapes inside query
        // values. Decode the outer URL, but do not silently rewrite those values.
        if (!goal && /^https?:\/\/[^\s]+$/i.test(asText(next).trim())) {
            best = child;
            stopReason = `A complete URL was recovered after ${trials} CyberChef trial${trials === 1 ? "" : "s"}; nested escapes were left intact.`;
            break;
        }
        if (nextVerified) {
            frontier.unshift(child);
            continue;
        }
        if (decision === "solved" || (step.confidence === "high" && isReadableTerminal(next) && !verifiedNextStep(next))) {
            best = child;
            stopReason = `A candidate result was found after ${trials} CyberChef trial${trials === 1 ? "" : "s"}.`;
            break;
        }
        frontier.push(child);
    }
    if (trials >= limits.maxTrials) stopReason = `The ${limits.maxTrials}-trial search budget was reached; the best tested recipe is shown.`;
    return { recipe: best.recipe, current: best.value, trace, trials, stopReason, catalogTotal: catalog.length };
}
