// Test setup file for Jest

// Add polyfills for jsdom environment
import { TextEncoder, TextDecoder } from "util";

if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;   
}

if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder as any;
}

// Mock logger for tests to prevent runtime errors
jest.mock("./utils/logging", () => ({
    __esModule: true,
    default: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        enableDebugMode: jest.fn()
    }
}));

// Mock GAM (Google Ad Manager) for tests
if (typeof window !== "undefined") {
    (window as any).googletag = {
        cmd: [],
        display: jest.fn(),
        pubads: jest.fn(() => ({
            getSlots: jest.fn(() => []),
            addEventListener: jest.fn()
        }))
    };
}

// Define custom elements for testing
if (typeof customElements === "undefined") {
    Object.defineProperty(global, "customElements", {
        value: {
            define: jest.fn(),
            whenDefined: jest.fn().mockResolvedValue(undefined),
            get: jest.fn()
        },
        writable: true
    });
}

// Mock MessageChannel if not available
if (typeof MessageChannel === "undefined") {
    Object.defineProperty(global, "MessageChannel", {
        value: class MockMessageChannel {
            port1 = {
                postMessage: jest.fn(),
                onmessage: null,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                start: jest.fn(),
                close: jest.fn()
            };
            port2 = {
                postMessage: jest.fn(),
                onmessage: null,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                start: jest.fn(),
                close: jest.fn()
            };
        },
        writable: true
    });
}
