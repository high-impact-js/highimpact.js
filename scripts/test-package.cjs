const assert = require("node:assert/strict");
const { mkdtempSync, readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const temp = mkdtempSync(path.join(tmpdir(), "highimpact-package-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
function run(command, args, cwd = temp, timeout = 120_000) {
    try {
        return execFileSync(command, args, {
            cwd,
            env: {
                ...process.env,
                NODE_PATH: "",
                npm_config_cache: path.join(temp, "npm-cache")
            },
            encoding: "utf8",
            timeout,
            stdio: ["ignore", "pipe", "pipe"]
        });
    } catch (error) {
        throw new Error(`${command} ${args.join(" ")} failed\n${error.stdout || ""}\n${error.stderr || ""}`, { cause: error });
    }
}
const core = { Advantage: "function", advantageWrapAdSlotElement: "function", AdvantageFormatName: "object", AdvantageAdSlotResponder: "function" };
const creative = { AdvantageCreativeMessenger: "function", AdvantageMessageAction: "object", AdvantageFormatName: "object" };
const gam = { connectGoogleAdManager: "function" };
const full = { ...core, defineSlot: "function", setConfig: "function", setTemplateConfig: "function" };
const endpoints = {
    ".": full,
    "./advantage": core,
    "./advantage/gam": gam,
    "./types": { AdvantageFormatName: "object", AdvantageMessageAction: "object" },
    "./messaging": { AdvantageAdSlotResponder: "function" },
    "./creative": creative,
    "./publisher": { AdvantageAdSlotResponder: "function" },
    "./utils": { collectIframes: "function", traverseNodes: "function", advantageWrapAdSlotElement: "function", sendMessageAndAwaitResponse: "function" }
};
try {
    const packed = JSON.parse(run(npm, ["pack", "--json", "--pack-destination", temp], root));
    writeFileSync(path.join(temp, "package.json"), JSON.stringify({ private: true, type: "module" }));
    run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund", path.join(temp, packed[0].filename)]);
    const installed = path.join(temp, "node_modules/highimpact.js");
    const manifest = JSON.parse(readFileSync(path.join(installed, "package.json"), "utf8"));
    assert.equal(manifest.types, manifest.exports["."].types, "Legacy and modern consumers must receive the same root declarations");
    assert.deepEqual(Object.keys(manifest.exports).sort(), Object.keys(endpoints).sort(), "Update package smoke expectations for new or removed endpoints");
    function checkTarget(target) {
        assert.ok(existsSync(path.join(installed, target)), `Missing packaged target: ${target}`);
    }
    for (const field of ["main", "module", "types"]) checkTarget(manifest[field]);
    for (const conditions of Object.values(manifest.exports)) {
        for (const target of Object.values(conditions)) checkTarget(target);
    }
    // Only the harness uses our dev dependencies. Package imports resolve from
    // the copied consumer, without repository aliases or node_modules links.
    copyFileSync(path.join(__dirname, "package-tests/runtime.cjs"), path.join(temp, "runtime.cjs"));
    function runtime(mode, target, expected, globalName = "") {
        run(process.execPath, ["--unhandled-rejections=strict", "runtime.cjs", require.resolve("jsdom"), mode, target, JSON.stringify(expected), globalName], temp, 15_000);
        console.log(`✓ ${mode}: ${target.replace(installed, "highimpact.js")}`);
    }
    for (const [endpoint, expected] of Object.entries(endpoints)) {
        const specifier = endpoint === "." ? manifest.name : manifest.name + endpoint.slice(1);
        for (const mode of ["import", "require"]) runtime(mode, specifier, expected);
    }
    const bundles = {
        advantage: [full, "advantage"],
        "advantage-core": [core, "advantage"],
        "advantage-core-gam": [gam, "advantageGam"],
        "creative-side": [creative, "advantage"]
    };
    const expectedFiles = [];
    for (const [name, [expected, globalName]] of Object.entries(bundles)) {
        for (const [suffix, mode] of [["js", "import"], ["cjs", "require"], [name === "creative-side" ? "iife.js" : "umd.cjs", "script"]]) {
            const filename = `${name}.${suffix}`;
            expectedFiles.push(filename);
            runtime(mode, path.join(installed, "dist/bundles", filename), expected, globalName);
        }
    }
    assert.deepEqual(readdirSync(path.join(installed, "dist/bundles")).filter((file) => /\.(js|cjs)$/.test(file)).sort(), expectedFiles.sort(), "Add expectations for new standalone bundles");
    const imports = Object.entries(endpoints).map(([endpoint, expected], index) => {
        const specifier = endpoint === "." ? manifest.name : manifest.name + endpoint.slice(1);
        return `import * as api${index} from ${JSON.stringify(specifier)};\n${Object.keys(expected).map((name) => `void api${index}.${name};`).join("\n")}`;
    }).join("\n");
    writeFileSync(path.join(temp, "consumer.ts"), imports + `
import type { IAdvantageWrapper } from "highimpact.js/types";
import { Advantage } from "highimpact.js";
declare const wrapper: IAdvantageWrapper;
const reset: Promise<void> = wrapper.reset();
const close: Promise<void> = wrapper.close();
reset.catch(console.error);
close.catch(console.error);
Advantage.getInstance().wrappers[0].reset().catch(console.error);
Advantage.getInstance().wrappers[0].close().catch(console.error);
`);
    run(process.execPath, [require.resolve("typescript/bin/tsc"), "--noEmit", "--strict", "--skipLibCheck", "false", "--target", "ES2020", "--module", "ESNext", "--moduleResolution", "bundler", "consumer.ts"]);
    console.log("✓ TypeScript consumer (all endpoints and async lifecycle methods)");
    for (const script of ["verify-core-bundle.cjs", "verify-format-agnostic-core.cjs", "verify-legacy-creative.cjs"]) {
        console.log(run(process.execPath, [path.join(__dirname, script)], installed).trim());
    }
    console.log("Package smoke tests passed (installed npm tarball).");
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    rmSync(temp, { recursive: true, force: true });
}
