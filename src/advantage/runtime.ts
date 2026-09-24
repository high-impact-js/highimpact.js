import { version } from "../../package.json";

// Keep the discovery key stable so incompatible runtimes cannot silently install
// competing instances into the same global functions and custom-element registry.
const key = Symbol.for("highimpact.js/runtime");
interface Runtime {
    protocol: 1;
    version: string;
    values: Map<string, unknown>;
}

const host = globalThis as typeof globalThis & { [key]?: Runtime };
const existing = host[key];
if (existing && (existing.protocol !== 1 || existing.version !== version)) {
    throw new Error(
        `highimpact.js ${version} cannot load alongside runtime ${existing.version}. Load one package version per window.`
    );
}
const runtime = (host[key] ??= {
    protocol: 1,
    version,
    values: new Map<string, unknown>()
});

/** @internal Shared only within this browser realm and package version. */
export const getSharedState = <T>(name: string, create: () => T): T => {
    if (!runtime.values.has(name)) {
        runtime.values.set(name, create());
    }
    return runtime.values.get(name) as T;
};
