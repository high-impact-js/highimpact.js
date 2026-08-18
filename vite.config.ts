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
        insertTypesEntry: true,
        exclude: ["node_modules/**", "playground/**"]
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
                resolve(import.meta.dirname, "src/advantage/index.ts"),
                resolve(import.meta.dirname, "src/utils/index.ts")
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

        let entryFile: string;
        let fileNamePrefix: string;
        let formats: LibraryFormats[];

        if (isCreative) {
            entryFile = "src/advantage/messaging/creative-side.ts";
            fileNamePrefix = "creative-side";
            formats = ["es", "cjs", "iife"];
        } else {
            entryFile = "src/advantage/index.ts";
            fileNamePrefix = "advantage";
            formats = ["es", "cjs", "umd"];
        }

        buildConfig.plugins = undefined; // plugins are not needed for bundle builds
        buildConfig.build = {
            ...buildConfig.build,
            lib: {
                entry: [resolve(import.meta.dirname, entryFile)],
                formats: formats,
                fileName: `${fileNamePrefix}`,
                name: "advantage"
            },
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
