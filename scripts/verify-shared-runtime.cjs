const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { JSDOM } = require("jsdom");
const { buildSync } = require("esbuild");

const core = readFileSync("dist/bundles/advantage-core.umd.cjs", "utf8");
const full = readFileSync("dist/bundles/advantage.umd.cjs", "utf8");
const key = Symbol.for("highimpact.js/runtime");

async function verify(first, second, ready) {
    const dom = new JSDOM('<!doctype html><body><div id="queued-slot"></div>', {
        url: "https://publisher.example/", runScripts: "outside-only"
    });
    const w = dom.window;
    try {
        if (ready) await new Promise((resolve) => w.addEventListener("load", resolve));
        let compatibilityCommands = 0;
        w.highImpactJs = { cmd: [
            async () => { compatibilityCommands++; await Promise.resolve(); },
            () => compatibilityCommands++
        ] };
        let commands = 0;
        let gamListeners = 0;
        let messageListeners = 0;
        const addEventListener = w.addEventListener.bind(w);
        w.addEventListener = (name, ...args) => {
            if (name === "message") messageListeners++;
            return addEventListener(name, ...args);
        };
        w.googletag = {
            cmd: { push: (callback) => callback() },
            pubads: () => ({ addEventListener: () => gamListeners++, getSlots: () => [] })
        };
        w.advantageCmdQueue = [() => {
            commands++;
            w.advantageCmdQueue.push(() => commands++);
        }];
        w.advantageWrapQueue = [["#queued-slot"]];
        w.eval(first);
        const firstAPI = { ...w.advantage };
        const instance = firstAPI.Advantage.getInstance();
        instance.configure({ formatAgnosticCreatives: {
            formatMappings: [{ format: "CUSTOM", sizes: [[970, 250]] }]
        }});
        if (firstAPI.setConfig) firstAPI.setConfig({ topBarHeight: 42 });
        const wrap = w.advantageWrapAdSlotElement;
        const command = w.advantageCmd;
        w.eval(second);
        const secondAPI = { ...w.advantage };
        assert.equal(secondAPI.Advantage.getInstance(), instance);
        assert.equal(w.advantageWrapAdSlotElement, wrap);
        assert.equal(w.advantageCmd, command);
        if (!ready) await new Promise((resolve) => w.addEventListener("load", resolve));
        assert.equal(commands, 2, "queued and nested callbacks execute once");
        w.advantageCmdQueue.push(() => commands++);
        assert.equal(commands, 3);
        assert.equal(w.document.querySelectorAll("advantage-wrapper").length, 1);
        const wrapper = w.document.querySelector("advantage-wrapper");
        assert.equal(instance.wrappers.filter((item) => item === wrapper).length, 1);
        const iframe = w.document.createElement("iframe");
        w.document.querySelector("#queued-slot").append(iframe);
        const activations = [];
        wrapper.forceFormat = async (...args) => activations.push(args);
        secondAPI.Advantage.getInstance().reportSlotRendered({ elementId: "queued-slot", size: [970, 250] });
        w.dispatchEvent(new w.MessageEvent("message", {
            data: { sender: "high-impact-js", action: "AD_RENDERED" }, source: iframe.contentWindow
        }));
        const compatibility = firstAPI.setConfig ? firstAPI : secondAPI.setConfig ? secondAPI : null;
        if (!compatibility) {
            assert.equal(activations.length, 1, "report and creative signal meet across copies");
            assert.equal(activations[0][0], "CUSTOM");
        } else {
            // Existing contract: full compatibility owns legacy creative signals;
            // loading it after core must be visible to the first wrapper class.
            assert.equal(activations.length, 0);
        }
        if (compatibility) {
            compatibility.setConfig({ topBarHeight: 57 });
            if (firstAPI.getConfig && secondAPI.getConfig) {
                assert.equal(firstAPI.getConfig(), secondAPI.getConfig());
            }
            instance.configure({ enableHighImpactCompatibility: true });
            await Promise.resolve();
            assert.equal(w.highImpactJs.getConfig().topBarHeight, 57);
            assert.equal(gamListeners, 1, "GAM plugin is installed once");
        }
        // Let both preloaded compatibility commands finish, including the
        // command after the async one, without replay during duplicate loads.
        await new Promise((resolve) => w.setTimeout(resolve, 0));
        assert.equal(compatibilityCommands, compatibility ? 2 : 0);
        const listenersBefore = messageListeners;
        w.eval(second);
        assert.equal(messageListeners, listenersBefore, "reloading installs no message listeners");
        assert.equal(commands, 3);
        assert.equal(compatibilityCommands, compatibility ? 2 : 0);
        assert.equal(w.document.querySelectorAll("advantage-wrapper").length, 1);

        // A later incompatible release must fail before overwriting globals.
        const apiBefore = w.advantage;
        const version = w[key].version;
        w[key].version = "incompatible-test-version";
        assert.throws(() => w.eval(second), /cannot load alongside runtime/);
        assert.equal(w.advantage, apiBefore);
        assert.equal(w.advantageCmd, command);
        w[key].version = version;
    } finally {
        dom.window.close();
    }
}

async function main() {
    for (const ready of [false, true]) {
        for (const [name, first, second] of [
            ["core/core", core, core], ["core/full", core, full],
            ["full/core", full, core], ["full/full", full, full]
        ]) {
            await verify(first, second, ready);
            console.log(`✓ shared runtime: ${name}, DOM ${ready ? "ready" : "loading"}`);
        }
    }
    // Independently compile consumer entry points, each carrying the library.
    const consumer = () => buildSync({
        stdin: { contents: `export * from ${JSON.stringify(resolve("dist/bundles/advantage-core.js"))}`, resolveDir: process.cwd() },
        bundle: true, format: "iife", globalName: "advantage", write: false
    }).outputFiles[0].text;
    await verify(consumer(), consumer(), true);
    console.log("✓ shared runtime: independently bundled consumers");

    const a = new JSDOM("", { runScripts: "outside-only" });
    const b = new JSDOM("", { runScripts: "outside-only" });
    try {
        a.window.eval(core);
        b.window.eval(core);
        assert.notEqual(a.window.advantage.Advantage.getInstance(), b.window.advantage.Advantage.getInstance());
    } finally { a.window.close(); b.window.close(); }
    console.log("✓ shared runtime: separate windows remain isolated");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
