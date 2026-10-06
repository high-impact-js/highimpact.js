// Copied into the temporary consumer so bare imports resolve its installed package.
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { readFileSync } = require("node:fs");
const { MessageChannel } = require("node:worker_threads");
const [jsdomPath, mode, target, expectedJSON, globalName] = process.argv.slice(2);
const { JSDOM, VirtualConsole } = require(jsdomPath);
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => errors.push(error));
const dom = new JSDOM("<!doctype html><body></body>", {
    url: "https://publisher.example/?sessionId=package-test",
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole
});
const { window } = dom;
window.MessageChannel = MessageChannel;
window.IntersectionObserver = class { observe() {} disconnect() {} };
for (const name of ["window", "document", "Document", "HTMLElement", "HTMLIFrameElement", "HTMLDivElement", "Element", "Node", "CustomEvent", "MutationObserver", "customElements", "CSSStyleSheet", "IntersectionObserver", "getComputedStyle"]) {
    globalThis[name] = window[name];
}
globalThis.MessageChannel = MessageChannel;

async function main() {
    let api;
    if (mode === "script") {
        window.eval(readFileSync(target, "utf8"));
        api = window[globalName];
    } else if (mode === "require") {
        api = require(target);
    } else {
        api = await import(target.startsWith("/") ? pathToFileURL(target).href : target);
    }
    for (const [name, type] of Object.entries(JSON.parse(expectedJSON))) {
        assert.equal(typeof api[name], type, `${target}: ${name}`);
    }
    if (api.Advantage) {
        assert.equal(Boolean(window.highImpactJs), Boolean(api.defineSlot), "Only the full entry should expose legacy compatibility");
        const calls = [];
        const advantage = api.Advantage.getInstance();
        advantage.configure({ formats: [{
            name: "PACKAGE_TEST", description: "Package smoke test",
            setup: async () => { calls.push("setup"); },
            reset: () => { calls.push("reset"); },
            close: () => { calls.push("close"); }
        }] });
        const mappings = { formatMappings: [{ format: "PACKAGE_TEST", sizes: [[970, 250]] }] };
        advantage.configure({
            formatIntegrations: [{ format: "PACKAGE_TEST", setup: async () => {} }],
            formatAgnosticCreatives: mappings
        });
        advantage.configure({ messageValidator: () => true });
        assert.ok(advantage.formats.has("PACKAGE_TEST"), "Unrelated updates preserve custom formats");
        assert.equal(advantage.config.formatAgnosticCreatives, mappings);
        assert.ok(advantage.formatIntegrations.has("PACKAGE_TEST"));
        advantage.configure({ formatIntegrations: [], formatAgnosticCreatives: undefined });
        assert.equal(advantage.formatIntegrations.size, 0);
        assert.equal(advantage.config.formatAgnosticCreatives, undefined);
        const wrapper = window.document.createElement("advantage-wrapper");
        window.document.body.append(wrapper);
        await wrapper.morphIntoFormat("PACKAGE_TEST");
        assert.equal(wrapper.getAttribute("current-format"), "PACKAGE_TEST");
        const reset = wrapper.reset();
        assert.equal(typeof reset.catch, "function");
        await reset;
        assert.ok(!wrapper.currentFormat);
        await wrapper.morphIntoFormat("PACKAGE_TEST");
        const close = wrapper.close();
        assert.equal(typeof close.catch, "function");
        await close;
        assert.ok(!wrapper.currentFormat);
        assert.deepEqual(calls, ["setup", "reset", "setup", "close"]);
        // A synchronous format error must surface as a catchable rejection.
        advantage.formats.get("PACKAGE_TEST").reset = () => { throw new Error("reset failure"); };
        await wrapper.morphIntoFormat("PACKAGE_TEST");
        await assert.rejects(wrapper.reset(), /reset failure/);
        advantage.formats.get("PACKAGE_TEST").close = () => { throw new Error("close failure"); };
        await assert.rejects(wrapper.close(), /close failure/);
        advantage.formats.get("PACKAGE_TEST").reset = () => {};
        await wrapper.reset();
        advantage.configure({}, { merge: false });
        assert.equal(advantage.formats.has("PACKAGE_TEST"), false);
        assert.deepEqual(Object.keys(advantage.config), []);
    }
    if (api.connectGoogleAdManager) {
        let handler;
        let removed;
        const reports = [];
        window.googletag = {
            cmd: { push: (fn) => fn() },
            pubads: () => ({
                addEventListener: (name, fn) => { assert.equal(name, "slotRenderEnded"); handler = fn; },
                removeEventListener: (name, fn) => { assert.equal(name, "slotRenderEnded"); removed = fn; }
            })
        };
        const connection = api.connectGoogleAdManager({ reportSlotRendered: (report) => { reports.push(report); return true; } });
        handler({ slot: { getSlotElementId: () => "slot" }, size: [970, 250], isEmpty: false });
        assert.equal(JSON.stringify(reports), JSON.stringify([{ elementId: "slot", size: [970, 250], isEmpty: false }]));
        connection.disconnect();
        assert.equal(removed, handler);
    }
    if (api.AdvantageCreativeMessenger) {
        const messenger = new api.AdvantageCreativeMessenger();
        assert.equal(typeof messenger.startSession, "function");
        assert.equal(typeof messenger.sendMessage, "function");
        assert.throws(() => messenger.onMessage(() => {}), /No message port available/);
    }
    if (api.collectIframes) {
        const container = window.document.createElement("div");
        container.innerHTML = "<section><iframe></iframe></section><iframe></iframe>";
        assert.equal(api.collectIframes(container).length, 2);
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.deepEqual(errors, [], "Uncaught browser errors");
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
    .finally(() => dom.window.close());
