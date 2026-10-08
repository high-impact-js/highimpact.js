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
const check = (valid: boolean, path: string, expected: string) => {
    if (!valid) {
        throw new TypeError(`Invalid Advantage configuration: ${path} must be ${expected}`);
    }
};
const optional = (value: unknown, type: string) =>
    value === undefined || typeof value === type;
const optionalFunctions = (value: Record<string, any>, path: string, keys: string[]) =>
    keys.forEach((key) =>
        check(optional(value[key], "function"), `${path}.${key}`, "a function")
    );
const name = (value: unknown, path: string) =>
    check(typeof value === "string" && value.length > 0, path, "a non-empty string");
const plainObject = (value: unknown, path: string) =>
    check(record(value), path, "a plain object");
const optionalArray = (value: unknown, path: string, validItem: (item: any, path: string) => void) => {
    if (value === undefined) return;
    check(Array.isArray(value), path, "an array");
    Array.from(value as unknown[]).forEach((item, index) => validItem(item, `${path}[${index}]`));
};

/** Validate the settings consumed by configuration and lifecycle code. */
export function validateConfig(value: unknown): asserts value is AdvantageConfig {
    plainObject(value, "config");
    const config = value as Record<string, any>;
    optionalFunctions(config, "config", ["configUrlResolver", "messageValidator"]);
    check(
        optional(config.enableHighImpactCompatibility, "boolean"),
        "config.enableHighImpactCompatibility", "a boolean"
    );
    optionalArray(config.formats, "config.formats", (format, path) => {
        plainObject(format, path);
        name(format.name, `${path}.name`);
        // Descriptions are informational, so omitting one is harmless.
        check(optional(format.description, "string"), `${path}.description`, "a string");
        check(typeof format.setup === "function", `${path}.setup`, "a function");
        check(typeof format.reset === "function", `${path}.reset`, "a function");
        optionalFunctions(format, path, ["close", "simulate"]);
    });
    optionalArray(config.formatIntegrations, "config.formatIntegrations", (integration, path) => {
        plainObject(integration, path);
        name(integration.format, `${path}.format`);
        check(typeof integration.setup === "function", `${path}.setup`, "a function");
        optionalFunctions(integration, path, ["reset", "close", "teardown", "onReset", "onClose"]);
        if (integration.options !== undefined) plainObject(integration.options, `${path}.options`);
    });
    const creatives = config.formatAgnosticCreatives;
    if (creatives === undefined) return;
    plainObject(creatives, "config.formatAgnosticCreatives");
    const mappingsPath = "config.formatAgnosticCreatives.formatMappings";
    check(Array.isArray(creatives.formatMappings), mappingsPath, "an array");
    optionalArray(creatives.formatMappings, mappingsPath, (mapping, path) => {
        plainObject(mapping, path);
        name(mapping.format, `${path}.format`);
        check(Array.isArray(mapping.sizes), `${path}.sizes`, "an array");
        optionalArray(mapping.sizes, `${path}.sizes`, (size, sizePath) => check(
            Array.isArray(size) && size.length === 2 && Array.from(size).every(
                (dimension) => typeof dimension === "number" && Number.isFinite(dimension)
            ),
            sizePath, "a [width, height] pair of finite numbers"
        ));
    });
}
