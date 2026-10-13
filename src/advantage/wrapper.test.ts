import { Advantage } from "./core";
import { registerCompatibilityLayer } from "./compatibility-registry";
import type { AdvantageFormat, AdvantageFormatIntegration, IAdvantageWrapper } from "../types";

const definitions = () => ({
    format: {
        name: "CUSTOM", description: "Lifecycle test",
        setup: jest.fn().mockResolvedValue(undefined),
        reset: jest.fn(), close: jest.fn()
    } satisfies AdvantageFormat,
    integration: {
        format: "CUSTOM", setup: jest.fn().mockResolvedValue(undefined),
        reset: jest.fn(), close: jest.fn()
    } satisfies AdvantageFormatIntegration
});
const createWrapper = () => {
    const wrapper = document.createElement("advantage-wrapper") as IAdvantageWrapper;
    document.body.append(wrapper);
    return wrapper;
};

describe("active wrapper lifecycle configuration", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        Advantage.getInstance().configure({}, { merge: false });
    });

    it.each(["reset", "close"] as const)("keeps old %s hooks when definitions are replaced", async (action) => {
        const advantage = Advantage.getInstance();
        const old = definitions();
        const next = definitions();
        advantage.configure({ formats: [old.format], formatIntegrations: [old.integration] });
        const wrapper = createWrapper();
        await wrapper.morphIntoFormat("CUSTOM");
        const setupConfig = old.integration.setup.mock.calls[0][2];
        advantage.configure({ formats: [next.format], formatIntegrations: [next.integration] });
        await wrapper[action]();
        expect(old.format[action]).toHaveBeenCalledTimes(1);
        expect(old.integration[action]).toHaveBeenCalledWith(wrapper, undefined, setupConfig);
        expect(next.format[action]).not.toHaveBeenCalled();
        expect(next.integration[action]).not.toHaveBeenCalled();
        await wrapper.morphIntoFormat("CUSTOM");
        await wrapper[action]();
        expect(next.format[action]).toHaveBeenCalledTimes(1);
        expect(next.integration[action]).toHaveBeenCalledTimes(1);
    });

    it.each(["reset", "close"] as const)("keeps %s hooks when configuration is cleared", async (action) => {
        const advantage = Advantage.getInstance();
        const old = definitions();
        advantage.configure({ formats: [old.format], formatIntegrations: [old.integration] });
        const wrapper = createWrapper();
        await wrapper.morphIntoFormat("CUSTOM");
        advantage.configure({}, { merge: false });
        await wrapper[action]();
        expect(old.format[action]).toHaveBeenCalledTimes(1);
        expect(old.integration[action]).toHaveBeenCalledTimes(1);
        expect(wrapper.currentFormat).toBe("");
        expect(advantage.formats.has("CUSTOM")).toBe(false);
    });

    it("does not run cleanup for an integration added after activation", async () => {
        const { format, integration } = definitions();
        const advantage = Advantage.getInstance();
        advantage.configure({ formats: [format] });
        const wrapper = createWrapper();
        await wrapper.morphIntoFormat("CUSTOM");
        advantage.configure({ formatIntegrations: [integration] });
        await wrapper.reset();
        expect(format.reset).toHaveBeenCalledTimes(1);
        expect(integration.reset).not.toHaveBeenCalled();
    });

    it("activates an options-only integration without a setup hook", async () => {
        const { format } = definitions();
        const advantage = Advantage.getInstance();
        advantage.configure({
            formats: [format],
            formatIntegrations: [{ format: "CUSTOM", options: { closeButton: false } }]
        });
        const wrapper = createWrapper();
        await expect(wrapper.morphIntoFormat("CUSTOM")).resolves.toBeUndefined();
        expect(format.setup).toHaveBeenCalledWith(
            wrapper, undefined, expect.objectContaining({ closeButton: false })
        );
        await wrapper.reset();
        expect(format.reset).toHaveBeenCalledTimes(1);
    });

    it("applies compatibility format options below integration and message options", async () => {
        registerCompatibilityLayer({
            initialize: jest.fn().mockResolvedValue(undefined),
            getConfig: () => ({}),
            getFormatOptions: (name) =>
                name === "CUSTOM" ? { height: 70, closeButton: true } : undefined
        });
        const { format } = definitions();
        Advantage.getInstance().configure({
            formats: [format],
            formatIntegrations: [{ format: "CUSTOM", options: { closeButton: false } }]
        });
        const wrapper = createWrapper();
        await wrapper.morphIntoFormat("CUSTOM");
        expect(format.setup).toHaveBeenLastCalledWith(
            wrapper, undefined, expect.objectContaining({ height: 70, closeButton: false })
        );
        await wrapper.reset();
        await wrapper.morphIntoFormat("CUSTOM", {
            type: "ADVANTAGE", action: "REQUEST_FORMAT", format: "CUSTOM", sessionID: "s", height: 50
        } as any);
        expect(format.setup).toHaveBeenLastCalledWith(
            wrapper, undefined, expect.objectContaining({ height: 50, closeButton: false })
        );
    });
});
