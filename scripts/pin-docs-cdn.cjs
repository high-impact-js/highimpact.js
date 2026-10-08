const { readdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

// Pin jsDelivr URLs in the docs to the released minor version, so copied
// snippets receive patches but never a breaking 0.x minor release.
const version = process.argv[2];
if (!/^\d+\.\d+\.\d+/.test(version ?? "")) {
    console.error("Usage: node scripts/pin-docs-cdn.cjs <version>");
    process.exit(1);
}
if (version.includes("-")) {
    console.log(`Skipping CDN pin for prerelease ${version}`);
    process.exit(0);
}

const range = version.split(".").slice(0, 2).join(".");
const pattern = /(cdn\.jsdelivr\.net\/npm\/highimpact\.js)(@[^/\s"'`]*)?\//g;
const files = readdirSync("www/docs", { recursive: true })
    .filter((file) => file.endsWith(".md") && !file.includes("node_modules"))
    .map((file) => join("www/docs", file));

for (const file of files) {
    const source = readFileSync(file, "utf8");
    const pinned = source.replace(pattern, `$1@${range}/`);
    if (pinned !== source) {
        writeFileSync(file, pinned);
        console.log(`Pinned CDN URLs in ${file} to @${range}`);
    }
}
