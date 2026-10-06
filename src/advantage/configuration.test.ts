import { Advantage } from "./advantage";
import type { AdvantageFormat } from "../types";
import { registerCompatibilityLayer } from "./compatibility-registry";
import logger from "../utils/logging";

jest.mock("./remote-config", () => ({
    __esModule: true,
    default: {
        configUrlResolver: jest.fn(() => "./remote-config"),
        formatIntegrations: [{ format: "REMOTE", setup: async () => {} }]
    }
}), { virtual: true });
jest.mock("./newer-config", () => ({
    __esModule: true,
    default: { formatIntegrations: [{ format: "NEWER", setup: async () => {} }] }
}), { virtual: true });
jest.mock("./invalid-config", () => ({ __esModule: true }), { virtual: true });
jest.mock("./failed-config", () => { throw new Error("network failure"); }, { virtual: true });

let mockRemoteValue: unknown;
jest.mock("./shape-config", () => ({
    __esModule: true,
    get default() { return mockRemoteValue; }
}), { virtual: true });

const format = (name: string): AdvantageFormat => ({
    name, description: name, setup: async () => {}, reset: () => {}, close: () => {}
});
const mappings = {
    formatMappings: [{ format: "CUSTOM", sizes: [[970, 250] as [number, number]] }]
};
const flushLoad = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("Advantage configuration updates", () => {
    const advantage = Advantage.getInstance();
    const defaults = advantage.defaultFormats;
    beforeEach(() => {
        advantage.defaultFormats = defaults;
        advantage.configure({}, { merge: false });
        jest.clearAllMocks();
    });

    it("preserves omitted settings and keeps derived maps consistent", () => {
        const custom = format("CUSTOM");
        const integration = { format: "CUSTOM", setup: async () => {} };
        advantage.configure({
            formats: [custom], formatIntegrations: [integration],
            formatAgnosticCreatives: mappings
        });
        const validator = () => true;
        advantage.configure({ messageValidator: validator });
        expect(advantage.config).toEqual({
            formats: [custom], formatIntegrations: [integration],
            formatAgnosticCreatives: mappings, messageValidator: validator
        });
        expect(advantage.formats.get("CUSTOM")).toBe(custom);
        expect(advantage.formatIntegrations.get("CUSTOM")).toBe(integration);
    });

    it("replaces supplied arrays and nested objects instead of accumulating", () => {
        advantage.configure({
            formats: [format("OLD")],
            formatIntegrations: [{ format: "OLD", setup: async () => {} }],
            formatAgnosticCreatives: mappings
        });
        advantage.configure({
            formats: [format("NEW")],
            formatIntegrations: [{ format: "NEW", setup: async () => {} }],
            formatAgnosticCreatives: { formatMappings: [] }
        });
        expect(advantage.formats.has("OLD")).toBe(false);
        expect(advantage.formats.has("NEW")).toBe(true);
        expect([...advantage.formatIntegrations.keys()]).toEqual(["NEW"]);
        expect(advantage.config?.formatAgnosticCreatives).toEqual({ formatMappings: [] });
        advantage.configure({ formats: [], formatIntegrations: [] });
        expect([...advantage.formats.values()]).toEqual(defaults);
        expect(advantage.formatIntegrations.size).toBe(0);
    });

    it("clears individual settings with undefined and replaces all settings on request", () => {
        const validator = () => true;
        advantage.configure({
            messageValidator: validator, formats: [format("CUSTOM")],
            formatIntegrations: [{ format: "CUSTOM", setup: async () => {} }],
            formatAgnosticCreatives: mappings
        });
        advantage.configure({ formatAgnosticCreatives: undefined, formats: undefined });
        expect(advantage.config?.formatAgnosticCreatives).toBeUndefined();
        expect(advantage.formats.has("CUSTOM")).toBe(false);
        expect(advantage.config?.messageValidator).toBe(validator);
        advantage.configure({}, { merge: false });
        expect(advantage.config).toEqual({});
        expect(advantage.formatIntegrations.size).toBe(0);
        expect([...advantage.formats.values()]).toEqual(defaults);
    });

    it("uses instance defaults consistently and lets the last named entry win", () => {
        const customDefault = format("DEFAULT");
        const override = format("DEFAULT");
        advantage.defaultFormats = [customDefault];
        advantage.configure({ formats: [override] });
        expect(advantage.formats.get("DEFAULT")).toBe(override);
        advantage.configure({ formats: [] });
        expect([...advantage.formats.values()]).toEqual([customDefault]);
    });

    it("initializes compatibility only when explicitly requested", async () => {
        const initialize = jest.fn().mockResolvedValue(undefined);
        registerCompatibilityLayer({ initialize, getConfig: () => ({}) });
        advantage.configure({ enableHighImpactCompatibility: true });
        advantage.configure({ formatAgnosticCreatives: mappings });
        advantage.configure({ enableHighImpactCompatibility: false });
        expect(initialize).toHaveBeenCalledTimes(1);
        advantage.configure({ enableHighImpactCompatibility: true });
        expect(initialize).toHaveBeenCalledTimes(2);
        await flushLoad();
    });

    it("merges remote configs without reloading an inherited resolver", async () => {
        const resolver = jest.fn(() => "./remote-config");
        advantage.configure({ formatAgnosticCreatives: mappings });
        advantage.configure({ configUrlResolver: resolver });
        await flushLoad();
        expect(advantage.config?.formatAgnosticCreatives).toBe(mappings);
        expect(advantage.formatIntegrations.has("REMOTE")).toBe(true);
        advantage.configure({ messageValidator: () => true });
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(advantage.config?.configUrlResolver).not.toHaveBeenCalled();
    });

    it("applies replacement mode to remote results", async () => {
        advantage.configure({ formats: [format("CUSTOM")], formatAgnosticCreatives: mappings });
        advantage.configure({ configUrlResolver: () => "./remote-config" }, { merge: false });
        await flushLoad();
        expect(advantage.config?.formatAgnosticCreatives).toBeUndefined();
        expect(advantage.formats.has("CUSTOM")).toBe(false);
        expect(advantage.formatIntegrations.has("REMOTE")).toBe(true);
    });

    it("discards a pending remote result after a newer local update", async () => {
        advantage.configure({ configUrlResolver: () => "./remote-config" });
        advantage.configure({ formatAgnosticCreatives: mappings });
        await flushLoad();
        expect(advantage.config).toEqual({ formatAgnosticCreatives: mappings });
        expect(advantage.formatIntegrations.size).toBe(0);
    });

    it("only applies the latest of multiple remote requests", async () => {
        advantage.configure({ configUrlResolver: () => "./remote-config" });
        advantage.configure({ configUrlResolver: () => "./newer-config" });
        await flushLoad();
        expect([...advantage.formatIntegrations.keys()]).toEqual(["NEWER"]);
    });

    it.each(["./invalid-config", "./failed-config"])("preserves state on load failure: %s", async (url) => {
        advantage.configure({ formatAgnosticCreatives: mappings });
        advantage.configure({ configUrlResolver: () => url }, { merge: false });
        await flushLoad();
        expect(advantage.config).toEqual({ formatAgnosticCreatives: mappings });
        expect(logger.error).toHaveBeenCalled();
    });
    it("logs synchronous resolver failures without changing active state", () => {
        advantage.configure({ formatAgnosticCreatives: mappings });
        const previous = advantage.config;
        expect(() => advantage.configure({
            configUrlResolver: () => { throw new Error("resolver failed"); }
        }, { merge: false })).not.toThrow();
        expect(advantage.config).toBe(previous);
        expect(logger.error).toHaveBeenCalledWith("Error fetching config", expect.any(Error));
    });

    it.each([
        ["promise", Promise.resolve({})],
        ["date", new Date()],
        ["non-array formats", { formats: {} }],
        ["null format", { formats: [null] }],
        ["missing format hooks", { formats: [{ name: "BAD" }] }],
        ["non-array integrations", { formatIntegrations: {} }],
        ["invalid integration hook", { formatIntegrations: [{ format: "BAD", setup: true }] }],
        ["invalid mapping", { formatAgnosticCreatives: { formatMappings: [{ format: "BAD" }] } }],
        ["invalid size", { formatAgnosticCreatives: { formatMappings: [{ format: "BAD", sizes: [[1, "2"]] }] } }]
    ])("rejects a remote %s atomically", async (_name, value) => {
        advantage.configure({
            formats: [format("CUSTOM")],
            formatIntegrations: [{ format: "CUSTOM", setup: async () => {} }],
            formatAgnosticCreatives: mappings
        });
        const previous = [advantage.config, advantage.formats, advantage.formatIntegrations];
        mockRemoteValue = value;
        advantage.configure({ configUrlResolver: () => "./shape-config" }, { merge: false });
        await flushLoad();
        expect(advantage.config).toBe(previous[0]);
        expect(advantage.formats).toBe(previous[1]);
        expect(advantage.formatIntegrations).toBe(previous[2]);
        expect(logger.error).toHaveBeenCalled();
    });

});
