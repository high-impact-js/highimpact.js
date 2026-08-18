// Test setup file for Jest

// Add polyfills for jsdom environment
import { jest } from "@jest/globals";
import { TextEncoder, TextDecoder } from "util";
import {
    ReadableStream,
    TransformStream,
    WritableStream
} from "node:stream/web";
import { MessageChannel, MessagePort } from "node:worker_threads";

if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;   
}

if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder as any;
}

if (typeof globalThis.ReadableStream === "undefined") {
    Object.defineProperty(globalThis, "ReadableStream", {
        value: ReadableStream,
        writable: true
    });
    Object.defineProperty(globalThis, "TransformStream", {
        value: TransformStream,
        writable: true
    });
    Object.defineProperty(globalThis, "WritableStream", {
        value: WritableStream,
        writable: true
    });
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
            whenDefined: jest.fn(async () => {}),
            get: jest.fn()
        },
        writable: true
    });
}

// jsdom's Undici integration requires Node's MessagePort implementation.
if (typeof globalThis.MessageChannel === "undefined") {
    Object.defineProperty(globalThis, "MessageChannel", {
        value: MessageChannel,
        writable: true
    });
}

if (typeof globalThis.MessagePort === "undefined") {
    Object.defineProperty(globalThis, "MessagePort", {
        value: MessagePort,
        writable: true
    });
}
