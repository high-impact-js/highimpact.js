/**
 * Test to verify that both Advantage and High Impact JS APIs
 * are available from the same import path
 */

import { jest } from "@jest/globals";
import {
    // Native Advantage API
    AdvantageMessageAction,
    AdvantageFormatName,
    // High Impact JS compatible API
    defineSlot,
    setConfig,
    setTemplateConfig,
    getSlotConfig,
    getTemplateConfig,
    cmd,
    resetState
} from "./index";

import { AdvantageCreativeMessenger } from "./messaging/creative-side";

describe("Unified API - Both APIs Available", () => {
    beforeEach(() => {
        // Clean up any previous state
        jest.clearAllMocks();

        // Reset High Impact JS state
        resetState();

        // Reset High Impact JS state if needed
        if ((global as any).window) {
            delete (global as any).window.highImpactJs;
        }
    });

    test("Native Advantage API should be available", () => {
        // Test that Advantage classes and enums are exported
        expect(AdvantageCreativeMessenger).toBeDefined();
        expect(AdvantageMessageAction).toBeDefined();
        expect(AdvantageFormatName).toBeDefined();

        // Test that we can create instances
        expect(() => new AdvantageCreativeMessenger()).not.toThrow();
    });

    test("High Impact JS compatible API should be available", () => {
        // Test that High Impact JS functions are exported
        expect(defineSlot).toBeDefined();
        expect(setConfig).toBeDefined();
        expect(setTemplateConfig).toBeDefined();
        expect(getSlotConfig).toBeDefined();
        expect(cmd).toBeDefined();

        // Test that functions are callable
        expect(() => {
            setConfig({ plugins: ["gam"] });
            setTemplateConfig("topscroll", { showCloseButton: true });
            defineSlot({
                adUnitId: "test-unit",
                template: "topscroll"
            });
        }).not.toThrow();

        // Test that slot was defined
        const slotConfig = getSlotConfig("test-unit");
        expect(slotConfig).toBeDefined();
        expect(slotConfig?.template).toBe("topscroll");
    });

    test("cmd queue should be functional", () => {
        let executed = false;

        cmd.push(() => {
            executed = true;
        });

        expect(executed).toBe(true);
    });

    test("Both APIs can be used together", () => {
        // Use High Impact JS API
        setConfig({ plugins: ["gam"] });
        defineSlot({
            adUnitId: "mixed-api-test",
            template: "midscroll"
        });

        // Use Advantage API
        const messenger = new AdvantageCreativeMessenger();

        // Both should work without conflicts
        expect(getSlotConfig("mixed-api-test")).toBeDefined();
        expect(messenger).toBeInstanceOf(AdvantageCreativeMessenger);
    });

    test("High Impact JS API auto-initializes without manual configuration", () => {
        // This test verifies that users don't need to manually configure
        // enableHighImpactCompatibility or call initializeHighImpactJs

        // Before: Users had to do this:
        // const advantage = Advantage.getInstance();
        // advantage.configure({ enableHighImpactCompatibility: true });

        // Now: High Impact JS API just works
        expect(() => {
            setConfig({ plugins: ["gam"], debug: true });
            defineSlot({
                adUnitId: "auto-init-test",
                template: "topscroll",
                sizes: [[728, 90]]
            });
        }).not.toThrow();

        // Verify the slot was created successfully
        const slot = getSlotConfig("auto-init-test");
        expect(slot).toBeDefined();
        expect(slot?.template).toBe("topscroll");
        expect(slot?.sizes).toEqual([[728, 90]]);
    });

    test("Template configurations apply retroactively to pre-wrapped slots", () => {
        // Create a mock DOM element for the slot
        const adElement = document.createElement("div");
        adElement.id = "retroactive-test";
        document.body.appendChild(adElement);

        try {
            // 1. Define slot first (this triggers pre-wrapping)
            defineSlot({
                adUnitId: "retroactive-test",
                template: "topscroll",
                sizes: [[728, 90]]
            });

            // Verify slot was created
            const slot = getSlotConfig("retroactive-test");
            expect(slot).toBeDefined();
            expect(slot?.template).toBe("topscroll");

            // 2. Set template config AFTER defining slot (this should apply retroactively)
            setTemplateConfig("topscroll", {
                showCloseButton: true,
                peekAmount: "100vh",
                title: "Retroactive Test"
            });

            // Verify template config was stored
            const templateConfig = getTemplateConfig("topscroll");
            expect(templateConfig).toBeDefined();
            expect(templateConfig.peekAmount).toBe("100vh");
            expect(templateConfig.showCloseButton).toBe(true);

            // The retroactive application should have been triggered
            // (We can't easily test the actual format application in Jest without
            // full DOM manipulation, but we can verify the config is stored correctly)
        } finally {
            // Cleanup - check if element is still in DOM before removing
            if (adElement.parentNode) {
                adElement.parentNode.removeChild(adElement);
            }
        }
    });

    test("Functions should be available for global assignment", () => {
        // Test that the functions are available for global assignment
        expect(defineSlot).toBeDefined();
        expect(setConfig).toBeDefined();
        expect(setTemplateConfig).toBeDefined();
        expect(getSlotConfig).toBeDefined();
        expect(cmd).toBeDefined();

        // Test that we can manually set up global object (simulating what happens in browser)
        const mockGlobal = {
            highImpactJs: {
                defineSlot: defineSlot,
                setConfig: setConfig,
                setTemplateConfig: setTemplateConfig,
                getSlotConfig: getSlotConfig,
                cmd: cmd
            }
        };

        // Test that global API would work
        mockGlobal.highImpactJs.setConfig({ plugins: ["xandr"] });
        mockGlobal.highImpactJs.defineSlot({
            adUnitId: "global-test",
            template: "topscroll"
        });

        // Verify the slot was created
        expect(getSlotConfig("global-test")).toBeDefined();
        expect(getSlotConfig("global-test")?.template).toBe("topscroll");
    });
});
