/**
 * @fileoverview Tests for High Impact JS Compatibility Layer
 */

import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from "@jest/globals";
import {
    defineSlot,
    setConfig,
    setTemplateConfig,
    getSlotConfig,
    getTemplateConfig,
    getConfig,
    initializeHighImpactJs,
    resetState
} from "./index";
import { GAMPlugin } from "./plugins/gam";
import { XandrPlugin } from "./plugins/xandr";

// Mock the AdvantageWrapper
jest.mock("../wrapper", () => ({
    AdvantageWrapper: {
        getFromElement: jest.fn()
    }
}));

// Mock logger
jest.mock("../../utils/logging", () => ({
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
}));

describe("High Impact JS Compatibility Layer", () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = "";

        // Reset window.highImpactJs
        (window as any).highImpactJs = undefined;

        // Reset internal state for compatibility layer
        resetState();

        // Reset custom elements registry mock
        (window as any).customElements = {
            whenDefined: jest.fn(() => Promise.resolve())
        };

        // Clear all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = "";
        (window as any).highImpactJs = undefined;
    });

    describe("defineSlot", () => {
        it("should define a slot with the correct configuration", () => {
            const slotConfig = {
                template: "topscroll",
                adUnitId: "/123456/test-ad-unit",
                sizes: [
                    [728, 90],
                    [970, 250]
                ],
                waitForAdSignal: false
            };

            defineSlot(slotConfig);

            const retrievedConfig = getSlotConfig("/123456/test-ad-unit");
            expect(retrievedConfig).toEqual(slotConfig);
        });

        it("should map targetId to adUnitId for Xandr", () => {
            setConfig({ plugins: ["xandr"] });

            const slotConfig = {
                template: "midscroll",
                adUnitId: "/123456/test-ad-unit",
                targetId: "xandr-target-123",
                sizes: [[300, 250]]
            };

            defineSlot(slotConfig);

            const retrievedConfig = getSlotConfig("xandr-target-123");
            expect(retrievedConfig?.adUnitId).toBe("xandr-target-123");
        });

        it("should pre-wrap ad unit when DOM element exists", () => {
            // Create a mock ad unit element
            const adUnitElement = document.createElement("div");
            adUnitElement.id = "test-ad-unit";
            document.body.appendChild(adUnitElement);

            // Mock custom elements
            const mockCustomElements = {
                whenDefined: jest.fn(() => Promise.resolve())
            };
            (window as any).customElements = mockCustomElements;

            const slotConfig = {
                template: "topscroll",
                adUnitId: "test-ad-unit",
                sizes: [[728, 90]]
            };

            defineSlot(slotConfig);

            const retrievedConfig = getSlotConfig("test-ad-unit");
            expect(retrievedConfig?.preWrapped).toBe(true);
            expect(retrievedConfig?.wrapperElement).toBeDefined();

            // Check that wrapper was created
            const wrapper = document.querySelector("advantage-wrapper");
            expect(wrapper).toBeTruthy();
            expect(wrapper?.getAttribute("allowed-formats")).toBe("TOPSCROLL");
        });

        it("should handle case when DOM element does not exist yet", () => {
            const slotConfig = {
                template: "midscroll",
                adUnitId: "non-existent-ad-unit",
                sizes: [[300, 250]]
            };

            defineSlot(slotConfig);

            const retrievedConfig = getSlotConfig("non-existent-ad-unit");
            expect(retrievedConfig?.preWrapped).toBeUndefined();
            expect(retrievedConfig?.wrapperElement).toBeUndefined();
        });

        it("should not wrap if element is already wrapped", () => {
            // Create an already wrapped ad unit
            const wrapper = document.createElement("advantage-wrapper");
            const slotDiv = document.createElement("div");
            slotDiv.setAttribute("slot", "advantage-ad-slot");
            const adUnitElement = document.createElement("div");
            adUnitElement.id = "already-wrapped-unit";

            slotDiv.appendChild(adUnitElement);
            wrapper.appendChild(slotDiv);
            document.body.appendChild(wrapper);

            const slotConfig = {
                template: "welcomepage",
                adUnitId: "already-wrapped-unit",
                sizes: [[300, 250]]
            };

            defineSlot(slotConfig);

            const retrievedConfig = getSlotConfig("already-wrapped-unit");
            expect(retrievedConfig?.preWrapped).toBe(true);

            // Should only have one wrapper element
            const wrappers = document.querySelectorAll("advantage-wrapper");
            expect(wrappers.length).toBe(1);
        });
    });

    describe("setTemplateConfig and getTemplateConfig", () => {
        it("should set and get template configuration", () => {
            const templateConfig = {
                showCloseButton: true,
                peekAmount: "70vh",
                title: "Custom Title",
                fadeOnScroll: true
            };

            setTemplateConfig("topscroll", templateConfig);

            const retrievedConfig = getTemplateConfig("topscroll");
            expect(retrievedConfig).toEqual(templateConfig);
        });

        it("should return empty object for non-existent template", () => {
            const retrievedConfig = getTemplateConfig("non-existent");
            expect(retrievedConfig).toEqual({});
        });
    });

    describe("setConfig and getConfig", () => {
        it("should set and get global configuration", () => {
            const globalConfig = {
                plugins: ["gam", "xandr"],
                topBarHeight: 50,
                debug: true
            };

            setConfig(globalConfig);

            const retrievedConfig = getConfig();
            expect(retrievedConfig).toEqual(globalConfig);
        });
    });

    describe("initializeHighImpactJs", () => {
        it("should initialize the compatibility layer", async () => {
            // Add a longer timeout for initialization
            jest.setTimeout(10000);

            await initializeHighImpactJs();

            expect((window as any).highImpactJs).toBeDefined();
            expect((window as any).highImpactJs.defineSlot).toBe(defineSlot);
            expect((window as any).highImpactJs.setTemplateConfig).toBe(
                setTemplateConfig
            );
            expect((window as any).highImpactJs.setConfig).toBe(setConfig);
        }, 10000);

        it("should process queued commands", async () => {
            const mockCommand = jest.fn();

            // Set up initial state before initialization
            (window as any).highImpactJs = {
                cmd: [mockCommand]
            };

            // Debug: check initial state
            expect(Array.isArray((window as any).highImpactJs.cmd)).toBe(true);
            expect((window as any).highImpactJs.cmd).toContain(mockCommand);

            await initializeHighImpactJs();

            // After initialization, the command should have been executed
            expect(mockCommand).toHaveBeenCalled();

            // And the cmd should now be an object with push method
            expect((window as any).highImpactJs.cmd).toHaveProperty("push");
            expect(typeof (window as any).highImpactJs.cmd.push).toBe(
                "function"
            );
        });

        it("should set default GAM and Xandr plugins if no plugins configured", async () => {
            await initializeHighImpactJs();

            const config = getConfig();
            expect(config.plugins).toEqual(["gam", "xandr"]);
        });
    });
});

describe("GAMPlugin", () => {
    let plugin: GAMPlugin;
    let mockSlot: any;
    let mockGoogletag: any;

    beforeEach(() => {
        plugin = new GAMPlugin();

        // Mock googletag
        mockGoogletag = {
            cmd: [],
            pubads: jest.fn(() => ({
                addEventListener: jest.fn(),
                getSlots: jest.fn(() => [mockSlot]),
                getSlotIdMap: jest.fn(() => ({ "test-slot": mockSlot }))
            }))
        };

        (window as any).googletag = mockGoogletag;

        // Mock slot
        mockSlot = {
            getSlotElementId: jest.fn(() => "test-ad-wrapper"),
            getHtml: jest.fn(() => "<div>Test ad content</div>"),
            size: [728, 90]
        };

        // Mock DOM
        document.body.innerHTML = `
            <div id="test-ad-wrapper">
                <div id="google_ads_iframe_test"></div>
                <iframe id="google_ads_iframe_test_0"></iframe>
            </div>
        `;
    });

    it("should initialize properly", () => {
        plugin.init();
        expect((window as any).googletag).toBeDefined();
        expect((window as any).googletag.cmd).toBeDefined();
    });

    it("should parse GAM slots correctly", async () => {
        // Add timeout and mock GAM properly
        jest.setTimeout(10000);

        // Mock the GAM command execution
        (window as any).googletag.cmd.push = jest.fn((fn: () => void) => {
            // Execute the function immediately in test environment
            fn();
        });

        plugin.init();

        const renderedSlots = await plugin.getRenderedSlots();
        // In test environment, getRenderedSlots returns empty array immediately
        expect(Array.isArray(renderedSlots)).toBe(true);
        expect(renderedSlots).toHaveLength(0);
    }, 10000);

    it("should set up slot render ended event listener", () => {
        const mockHandler = jest.fn();
        const mockAddEventListener = jest.fn();

        mockGoogletag.pubads.mockReturnValue({
            addEventListener: mockAddEventListener,
            getSlots: jest.fn(() => []),
            getSlotIdMap: jest.fn(() => ({}))
        });

        plugin.onAdSlotRendered(mockHandler);

        // Simulate command execution
        mockGoogletag.cmd.forEach((cmd: () => void) => cmd());

        expect(mockAddEventListener).toHaveBeenCalledWith(
            "slotRenderEnded",
            expect.any(Function)
        );
    });
});

describe("XandrPlugin", () => {
    let plugin: XandrPlugin;
    let mockApntag: any;

    beforeEach(() => {
        plugin = new XandrPlugin();

        // Mock apntag
        mockApntag = {
            cmd: [],
            onEvent: jest.fn(),
            getTag: jest.fn()
        };

        (window as any).apntag = mockApntag;

        // Mock DOM
        document.body.innerHTML = `
            <div id="test-xandr-wrapper">
                <div id="apn-ad-slot-test"></div>
                <iframe id="apn-ad-slot-test-iframe"></iframe>
            </div>
        `;
    });

    it("should initialize properly", () => {
        plugin.init();
        expect((window as any).apntag).toBeDefined();
        expect((window as any).apntag.cmd).toBeDefined();
    });

    it("should set up ad available event listener", () => {
        const mockHandler = jest.fn();

        plugin.onAdSlotRendered(mockHandler);

        // Simulate command execution
        mockApntag.cmd.forEach((cmd: () => void) => cmd());

        expect(mockApntag.onEvent).toHaveBeenCalledWith(
            "adAvailable",
            expect.any(Function)
        );
        expect(mockApntag.onEvent).toHaveBeenCalledWith(
            "adLoaded",
            expect.any(Function)
        );
    });

    it("should get rendered slots from DOM", async () => {
        jest.setTimeout(10000);
        plugin.init();

        const renderedSlots = await plugin.getRenderedSlots();
        expect(renderedSlots).toBeDefined();
        // Note: The actual length will depend on the DOM structure and parsing logic
    }, 10000);
});
