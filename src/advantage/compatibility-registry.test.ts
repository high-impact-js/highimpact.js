import {
    getRegisteredCompatibilityConfig,
    getRegisteredCompatibilityFormatOptions,
    initializeRegisteredCompatibilityLayer,
    registerCompatibilityLayer
} from "./compatibility-registry";

describe("compatibility registry", () => {
    it("keeps compatibility optional for Advantage core", () => {
        expect(getRegisteredCompatibilityConfig()).toEqual({});
        expect(getRegisteredCompatibilityFormatOptions("MIDSCROLL")).toEqual({});
        expect(initializeRegisteredCompatibilityLayer()).toBeUndefined();
    });

    it("delegates to a loaded compatibility layer", async () => {
        const initialize = jest.fn().mockResolvedValue(undefined);
        const config = { plugins: ["gam"], topBarHeight: 48 };

        registerCompatibilityLayer({
            initialize,
            getConfig: () => config,
            getFormatOptions: (format) =>
                format === "MIDSCROLL" ? { height: 80 } : undefined
        });

        expect(getRegisteredCompatibilityConfig()).toEqual(config);
        expect(getRegisteredCompatibilityFormatOptions("MIDSCROLL")).toEqual({
            height: 80
        });
        expect(getRegisteredCompatibilityFormatOptions("TOPSCROLL")).toEqual({});
        await initializeRegisteredCompatibilityLayer();
        expect(initialize).toHaveBeenCalledTimes(1);
    });
});
