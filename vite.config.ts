// vite.config.ts
import { resolve } from "path";
import { ConfigEnv, defineConfig, LibraryFormats, UserConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import noBundlePlugin from "vite-plugin-no-bundle";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

// Common plugins used in multiple configurations
const commonPlugins = [
    dts({
        // Importing the package version must not move declarations under dist/src.
        entryRoot: "src",
        insertTypesEntry: true,
        exclude: [
            "node_modules/**",
            "playground/**",
            "src/**/*.test.ts",
            "src/test-setup.ts"
        ]
    }),
    tsconfigPaths()
];

// Production plugins include common plugins and any additional ones for production
const productionPlugins = [
    ...commonPlugins, // Spread the common plugins here
    noBundlePlugin()
];

// Base configuration used as a starting point for all builds
const baseConfig: UserConfig = {
    plugins: commonPlugins,
    css: {
        transformer: "lightningcss",
        lightningcss: {
            // @see https://browsersl.ist/#q=defaults+and+fully+supports+es6-module&region=SE
            targets: browserslistToTargets(
                browserslist("defaults and fully supports es6-module")
            )
        }
    },
    build: {
        sourcemap: true,
        lib: {
            entry: [
                resolve(__dirname, "src/advantage/index.ts"),
                resolve(__dirname, "src/advantage/core.ts"),
                resolve(__dirname, "src/advantage/ad-servers/gam.ts"),
                resolve(__dirname, "src/advantage/messaging/index.ts"),
                resolve(__dirname, "src/advantage/messaging/creative-side.ts"),
                resolve(__dirname, "src/utils/index.ts")
            ],
            formats: ["es", "cjs"]
        },
        copyPublicDir: false,
        outDir: "dist"
    }
};

// Function to create build configurations for different modes
function createBuildConfig(env: ConfigEnv): UserConfig {
    const isProduction = env.command === "build" && env.mode === "production";
    const isBundle = env.command === "build" && env.mode.startsWith("bundle");

    let buildConfig = { ...baseConfig };

    if (isProduction) {
        buildConfig.plugins = productionPlugins;
        buildConfig.build!.cssMinify = "lightningcss";
        buildConfig.build!.sourcemap = false;
        buildConfig.build!.minify = false;
    }

    if (isBundle) {
        const isCreative = env.mode.includes(":creative");
        const isCore = env.mode.includes(":core");
        const isGam = env.mode.includes(":gam");

        let entryFile: string;
        let fileNamePrefix: string;
        let formats: LibraryFormats[];
        let libraryName = "advantage";

        if (isCreative) {
            entryFile = "src/advantage/messaging/creative-side.ts";
            fileNamePrefix = "creative-side";
            formats = ["es", "cjs", "iife"];
        } else if (isCore) {
            if (isGam) {
                entryFile = "src/advantage/ad-servers/gam.ts";
                fileNamePrefix = "advantage-core-gam";
                libraryName = "advantageGam";
                formats = ["es", "cjs", "umd"];
            } else {
                entryFile = "src/advantage/core.ts";
                fileNamePrefix = "advantage-core";
                formats = ["es", "cjs", "umd"];
            }
        } else {
            entryFile = "src/advantage/index.ts";
            fileNamePrefix = "advantage";
            formats = ["es", "cjs", "umd"];
        }

        buildConfig.plugins = undefined; // plugins are not needed for bundle builds
        buildConfig.build = {
            ...buildConfig.build,
            lib: {
                entry: [resolve(__dirname, entryFile)],
                formats: formats,
                fileName: `${fileNamePrefix}`,
                name: libraryName
            },
            // Preserve the existing browser namespace if a later bundle rejects
            // an incompatible runtime, or adds the full API after lean core.
            rollupOptions: { output: { extend: !isCreative && !isGam } },
            sourcemap: true,
            minify: true,
            cssMinify: "lightningcss",
            outDir: `dist/bundles`,
            emptyOutDir: false // do not delete the output directory before building
        };
    }

    return buildConfig;
}

export default defineConfig((env) => {
    console.log("Building in", env.mode);
    return createBuildConfig(env);
});
