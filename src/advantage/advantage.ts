import { logger } from "../utils";
import { validateConfig } from "./config-validation";

import type {
    AdvantageConfig,
    AdvantageConfigureOptions,
    IAdvantageWrapper,
    AdvantageFormat,
    AdvantageFormatIntegration,
    AdvantageSlotRenderReport
} from "../types";
import { defaultFormats } from "./formats";
import { initializeRegisteredCompatibilityLayer } from "./compatibility-registry";
import { reportSlotRendered } from "./format-agnostic-creative";

/**
 * The main class for the Advantage library. This class is a singleton and is used to configure the library, register wrappers, and register custom elements.
 * @public
 */
export class Advantage {
    private static instance: Advantage | null = null;
    config: AdvantageConfig | null = null;
    defaultFormats: AdvantageFormat[] = defaultFormats;
    wrappers: IAdvantageWrapper[] = [];
    #customWrappers: HTMLElement[] = [];
    formats: Map<string, AdvantageFormat> = new Map();
    formatIntegrations: Map<string, AdvantageFormatIntegration> = new Map();
    public static id = 0;
    private configurationRevision = 0;

    private constructor() {
        Advantage.id++;
        logger.info("Advantage constructor", Advantage.id);
    }
    /**
     * Shallow-merge supplied top-level settings. Omitted keys survive; arrays
     * and nested objects are replaced. Explicit undefined clears a setting.
     * Use { merge: false } to replace the configuration entirely.
     *
     * A resolver loads a default-exported config instead of applying local
     * settings. Any newer configure call supersedes that pending load.
     */
    public configure(
        config: AdvantageConfig,
        options: AdvantageConfigureOptions = {}
    ): void {
        const revision = ++this.configurationRevision;
        const merge = options.merge !== false;
        if (config.configUrlResolver) {
            try {
                this.loadConfig(config.configUrlResolver(), merge, revision);
            } catch (error) {
                logger.error("Error fetching config", error);
            }
        } else {
            this.applyConfig(config, merge);
        }
    }

    // Public method to register a wrapper with the library.
    public registerWrapper(wrapper: IAdvantageWrapper) {
        this.wrappers.push(wrapper);
        logger.info("Wrapper registered", wrapper);
    }

    // Public method to unregister a wrapper from the library.
    public unregisterWrapper(wrapper: IAdvantageWrapper) {
        const index = this.wrappers.indexOf(wrapper);
        if (index > -1) {
            this.wrappers.splice(index, 1);
            logger.info("Wrapper unregistered", wrapper);
        }
    }

    // Public method to register a custom wrapper with the library.
    public registerCustomWrapper(wrapper: HTMLElement) {
        this.#customWrappers.push(wrapper);
        logger.info("Custom wrapper registered", wrapper);
    }

    /**
     * Reports the size selected by an ad server for a wrapped slot. This is
     * paired with a format-agnostic creative's AD_RENDERED signal before a
     * format is activated.
     *
     * @experimental The format-agnostic creative API may change before release.
     */
    public reportSlotRendered(report: AdvantageSlotRenderReport): boolean {
        return reportSlotRendered(this, report);
    }

    // Public method to get a reference to the singleton instance of the library.
    public static getInstance(): Advantage {
        if (!Advantage.instance) {
            logger.info("Creating a new instance of Advantage");
            Advantage.instance = new Advantage();
        }
        return Advantage.instance;
    }

    // Private method to load the configuration from a remote file.
    private loadConfig(configUrl: string, merge: boolean, revision: number) {
        logger.info(`⬇ Loading config from remote URL: ${configUrl}`);
        import(/* @vite-ignore */ configUrl)
            .then((module) => {
                if (revision !== this.configurationRevision) return;
                const config = module.default;
                this.applyConfig(config, merge);
            })
            .catch((e) => {
                logger.error("Error fetching config", e);
            });
    }

    // Private method to apply the configuration to the library.
    private applyConfig(config: AdvantageConfig, merge: boolean) {
        validateConfig(config);
        const nextConfig = merge ? { ...this.config, ...config } : { ...config };
        validateConfig(nextConfig);
        // Build all derived state before committing any of it. A failed update
        // must leave the config and both maps pointing to the previous state.
        const formats = new Map(
            [...this.defaultFormats, ...(nextConfig.formats ?? [])].map((format) => [
                format.name, format
            ])
        );
        const integrations = new Map(
            (nextConfig.formatIntegrations ?? []).map((integration) => [
                integration.format, integration
            ])
        );
        this.config = nextConfig;
        this.formats = formats;
        this.formatIntegrations = integrations;
        logger.info("Format configurations applied ✅", formats);
        logger.info("Format integrations applied ✅", integrations);

        // Initialize High Impact JS compatibility layer if requested
        if (config.enableHighImpactCompatibility) {
            logger.info("Initializing High Impact JS compatibility layer");
            const initialization = initializeRegisteredCompatibilityLayer();
            if (!initialization) {
                logger.error(
                    "High Impact JS compatibility was enabled, but the compatibility entry point has not been loaded"
                );
                return;
            }
            initialization.catch((error) => {
                logger.error(
                    "Failed to initialize High Impact JS compatibility:",
                    error
                );
            });
        }
    }
}
