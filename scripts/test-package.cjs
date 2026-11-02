const assert = require("node:assert/strict");
const { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, rmSync } = require("node:fs");
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
function markdownFiles(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) return markdownFiles(file);
        return entry.name.endsWith(".md") ? [file] : [];
    });
}
// Release-matched agent docs: the files exist, their local links resolve inside
// the package, and setup-ai works from flat and hoisted workspace installs.
function checkAiDocs(installed, tarball) {
    const skills = ["highimpact-publisher", "highimpact-creative"];
    for (const file of ["ai/index.md", "www/api/index.md", "www/docs/tutorial/publisher.md", ...skills.map((skill) => `skills/${skill}/SKILL.md`)]) {
        assert.ok(existsSync(path.join(installed, file)), `Missing packaged documentation: ${file}`);
    }
    for (const skill of skills) {
        const frontmatter = readFileSync(path.join(installed, "skills", skill, "SKILL.md"), "utf8").match(/^---\n([\s\S]*?)\n---/);
        assert.ok(frontmatter, `${skill}/SKILL.md needs YAML frontmatter`);
        assert.match(frontmatter[1], new RegExp(`^name: ${skill}$`, "m"), `${skill}/SKILL.md must declare name: ${skill}`);
        assert.match(frontmatter[1], /^description: \S/m, `${skill}/SKILL.md needs a description`);
    }
    const docs = ["ai", "skills", "www/api"].flatMap((dir) => markdownFiles(path.join(installed, dir)));
    let links = 0;
    for (const file of docs) {
        for (const [, target] of readFileSync(file, "utf8").matchAll(/\]\(([^)\s]+)\)/g)) {
            if (/^([a-z]+:|#)/i.test(target)) continue;
            const resolved = path.resolve(path.dirname(file), decodeURIComponent(target.split("#")[0]));
            assert.ok(resolved.startsWith(installed + path.sep), `${path.relative(installed, file)} links outside the package: ${target}`);
            assert.ok(existsSync(resolved), `${path.relative(installed, file)} has a broken link: ${target}`);
            links++;
        }
    }
    console.log(`✓ AI docs: ${docs.length} Markdown files, ${links} local links resolve`);

    const bin = path.join(temp, "node_modules/.bin", process.platform === "win32" ? "highimpact.js.cmd" : "highimpact.js");
    const agents = path.join(temp, "AGENTS.md");
    const original = "# Team rules\n\nKeep this line.\n";
    writeFileSync(agents, original);
    run(bin, ["setup-ai"]);
    run(bin, ["setup-ai"]);
    const written = readFileSync(agents, "utf8");
    assert.ok(written.startsWith(original), "setup-ai must preserve existing AGENTS.md content");
    assert.equal(written.split("<!-- highimpact.js:start -->").length, 2, "setup-ai must write exactly one managed block");
    assert.match(written, /^node_modules\/highimpact\.js\/ai\/index\.md first\.$/m);
    run(bin, ["setup-ai", "--remove"]);
    assert.equal(readFileSync(agents, "utf8"), original, "setup-ai --remove must restore the original file");
    assert.match(run(bin, ["info"]), new RegExp(`highimpact\\.js ${manifestVersion(installed).replace(/\./g, "\\.")}`));
    console.log("✓ setup-ai (flat install): create, update, remove, info");

    const workspace = path.join(temp, "workspace");
    const site = path.join(workspace, "packages/site");
    mkdirSync(site, { recursive: true });
    writeFileSync(path.join(workspace, "package.json"), JSON.stringify({ private: true, workspaces: ["packages/*"] }));
    writeFileSync(path.join(site, "package.json"), JSON.stringify({ name: "site", private: true, dependencies: { "highimpact.js": `file:${tarball}` } }));
    run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund"], workspace);
    assert.ok(existsSync(path.join(workspace, "node_modules/highimpact.js/ai/index.md")), "Expected npm workspaces to hoist highimpact.js");
    run(npm, ["exec", "--no", "--", "highimpact.js", "setup-ai"], site);
    assert.match(readFileSync(path.join(site, "AGENTS.md"), "utf8"), /^\.\.\/\.\.\/node_modules\/highimpact\.js\/ai\/index\.md first\.$/m);
    console.log("✓ setup-ai (hoisted workspace install)");
}
function manifestVersion(dir) {
    return JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")).version;
}
try {
    const packOutput = JSON.parse(run(npm, ["pack", "--json", "--pack-destination", temp], root));
    // npm 12 reports { name: info } instead of [info].
    const tarball = path.join(temp, (Array.isArray(packOutput) ? packOutput[0] : Object.values(packOutput)[0]).filename);
    writeFileSync(path.join(temp, "package.json"), JSON.stringify({ private: true, type: "module" }));
    run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball]);
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
        for (const [suffix, mode] of [["js", "import"], ["cjs", "require"], ...(name === "creative-side" ? [["iife.js", "script"]] : [["umd.js", "script"], ["umd.cjs", "script"]])]) {
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
import type { AdvantageConfigureOptions } from "highimpact.js/types";
const replace: AdvantageConfigureOptions = { merge: false };
Advantage.getInstance().configure({}, replace);
Advantage.getInstance().configure({
    formats: undefined, formatIntegrations: undefined,
    formatAgnosticCreatives: undefined, messageValidator: undefined,
    configUrlResolver: undefined, enableHighImpactCompatibility: undefined
});
`);
    run(process.execPath, [require.resolve("typescript/bin/tsc"), "--noEmit", "--strict", "--exactOptionalPropertyTypes", "--skipLibCheck", "false", "--target", "ES2020", "--module", "ESNext", "--moduleResolution", "bundler", "consumer.ts"]);
    console.log("✓ TypeScript consumer (all endpoints and async lifecycle methods)");
    for (const script of ["verify-core-bundle.cjs", "verify-format-agnostic-core.cjs", "verify-legacy-creative.cjs", "verify-shared-runtime.cjs"]) {
        console.log(run(process.execPath, [path.join(__dirname, script)], installed).trim());
    }
    checkAiDocs(installed, tarball);
    console.log("Package smoke tests passed (installed npm tarball).");
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    rmSync(temp, { recursive: true, force: true });
}
