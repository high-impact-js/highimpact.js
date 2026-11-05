const { existsSync, readdirSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

// The shared runtime refuses to load next to a different version, comparing the
// version baked into the build. A dist built before the release bump carries the
// previous version, which disables that check between adjacent releases.
const { version } = require("../package.json");
const failures = [];

if (!existsSync("dist/package.json.cjs")) {
    console.error("dist/ is missing. Run `npm run build` before publishing.");
    process.exit(1);
}

const built = require("../dist/package.json.cjs").version;
if (built !== version) failures.push(`dist/package.json.cjs: ${built}`);

const literal = JSON.stringify(version);
for (const file of readdirSync("dist/bundles")) {
    const path = join("dist/bundles", file);
    if (!/\.c?js$/.test(file)) continue;
    const source = readFileSync(path, "utf8");
    if (source.includes("highimpact.js/runtime") && !source.includes(literal)) {
        failures.push(`${path}: does not contain ${literal}`);
    }
}

if (failures.length) {
    console.error(`Built files do not match package.json version ${version}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    console.error("Run `npm run build` after the version bump.");
    process.exit(1);
}
console.log(`Built runtime version verified: ${version}`);
