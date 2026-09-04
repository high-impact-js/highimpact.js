import {
    getRegisteredCompatibilityConfig,
    initializeRegisteredCompatibilityLayer,
    registerCompatibilityLayer
} from "./compatibility-registry";

describe("compatibility registry", () => {
    it("keeps compatibility optional for Advantage core", () => {
        expect(getRegisteredCompatibilityConfig()).toEqual({});
        expect(initializeRegisteredCompatibilityLayer()).toBeUndefined();
    });

    it("delegates to a loaded compatibility layer", async () => {
        const initialize = jest.fn().mockResolvedValue(undefined);
        const config = { plugins: ["gam"], topBarHeight: 48 };

        registerCompatibilityLayer({
            initialize,
            getConfig: () => config
        });

        expect(getRegisteredCompatibilityConfig()).toEqual(config);
        await initializeRegisteredCompatibilityLayer();
        expect(initialize).toHaveBeenCalledTimes(1);
    });
});
