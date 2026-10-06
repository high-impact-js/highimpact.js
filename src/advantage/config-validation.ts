import type { AdvantageConfig } from "../types";

const record = (value: unknown): value is Record<string, any> => {
    if (!value || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    if (prototype === null) return true;
    // Object.prototype differs across windows (and in browser test harnesses).
    const constructor = Object.prototype.hasOwnProperty.call(prototype, "constructor")
        && prototype.constructor;
    return typeof constructor === "function" &&
        Function.prototype.toString.call(constructor) === Function.prototype.toString.call(Object);
};
const optionalFunctions = (value: Record<string, any>, keys: string[]) =>
    keys.every((key) => value[key] === undefined || typeof value[key] === "function");
const named = (value: unknown, key: string): value is Record<string, any> =>
    record(value) && typeof value[key] === "string" && value[key].length > 0;
const optionalArray = (value: unknown, valid: (item: any) => boolean) =>
    value === undefined || (Array.isArray(value) && Array.from(value).every(valid));

/** Validate the settings consumed by configuration and lifecycle code. */
export function validateConfig(value: unknown): asserts value is AdvantageConfig {
    if (
        !record(value) ||
        !optionalFunctions(value, ["configUrlResolver", "messageValidator"]) ||
        (value.enableHighImpactCompatibility !== undefined &&
            typeof value.enableHighImpactCompatibility !== "boolean") ||
        !optionalArray(value.formats, (format) =>
            named(format, "name") && typeof format.description === "string" &&
            typeof format.setup === "function" && typeof format.reset === "function" &&
            optionalFunctions(format, ["close", "simulate"])
        ) ||
        !optionalArray(value.formatIntegrations, (integration) =>
            named(integration, "format") && typeof integration.setup === "function" &&
            optionalFunctions(integration, ["reset", "close", "teardown", "onReset", "onClose"]) &&
            (integration.options === undefined || record(integration.options))
        ) ||
        (value.formatAgnosticCreatives !== undefined && (
            !record(value.formatAgnosticCreatives) ||
            !Array.isArray(value.formatAgnosticCreatives.formatMappings) ||
            !Array.from(value.formatAgnosticCreatives.formatMappings).every((mapping) =>
                named(mapping, "format") && Array.isArray(mapping.sizes) &&
                Array.from(mapping.sizes).every((size) =>
                    Array.isArray(size) && size.length === 2 &&
                    Array.from(size).every((dimension) =>
                        typeof dimension === "number" && Number.isFinite(dimension)
                    )
                )
            )
        ))
    ) {
        throw new TypeError("Configuration must be a plain config object with valid settings");
    }
}
