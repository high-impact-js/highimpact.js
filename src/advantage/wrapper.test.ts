import { Advantage } from "./core";
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
});
