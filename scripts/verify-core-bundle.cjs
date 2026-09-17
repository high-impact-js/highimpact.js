const { readFileSync } = require("node:fs");
const { gzipSync } = require("node:zlib");

const bundlePath = "dist/bundles/advantage-core.umd.cjs";
const bundle = readFileSync(bundlePath);
const source = bundle.toString("utf8");
const gzipBytes = gzipSync(bundle, { level: 9 }).byteLength;

const limits = {
    minifiedBytes: 40_000,
    gzipBytes: 13_000
};
const forbiddenCompatibilityMarkers = [
    "highImpactJs",
    "[GAM Plugin]",
    "[Xandr Plugin]",
    "defineSlot",
    "slotRenderEnded"
];

const failures = [];
if (bundle.byteLength > limits.minifiedBytes) {
    failures.push(
        `minified size ${bundle.byteLength} exceeds ${limits.minifiedBytes} bytes`
    );
}
if (gzipBytes > limits.gzipBytes) {
    failures.push(`gzip size ${gzipBytes} exceeds ${limits.gzipBytes} bytes`);
}

for (const marker of forbiddenCompatibilityMarkers) {
    if (source.includes(marker)) {
        failures.push(`compatibility marker ${JSON.stringify(marker)} found`);
    }
}

if (failures.length > 0) {
    console.error(`Core bundle verification failed:\n- ${failures.join("\n- ")}`);
    process.exitCode = 1;
} else {
    console.log(
        `Core bundle verified: ${bundle.byteLength} bytes minified, ${gzipBytes} bytes gzip`
    );
}
