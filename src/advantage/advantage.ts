import { logger } from "../utils";
import { getSharedState } from "./runtime";

import type {
    AdvantageConfig,
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
    config: AdvantageConfig | null = null;
    defaultFormats: AdvantageFormat[] = defaultFormats;
    wrappers: IAdvantageWrapper[] = [];
    #customWrappers: HTMLElement[] = [];
    formats: Map<string, AdvantageFormat> = new Map();
    formatIntegrations: Map<string, AdvantageFormatIntegration> = new Map();
    public static id = 0;

    private constructor() {
        Advantage.id++;
        logger.info("Advantage constructor", Advantage.id);
    }
    // Entry point for the library. This is where the configuration is loaded and the library is initialized.
    public configure(config: AdvantageConfig) {
        if (config.configUrlResolver) {
            logger.info("Config URL resolver provided");
            this.loadConfig(config.configUrlResolver());
        } else {
            logger.info(
                "No config URL resolver provided, using provided config"
            );
            this.applyConfig(config);
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
        return getSharedState("advantage", () => new Advantage());
    }

    // Private method to load the configuration from a remote file.
    private loadConfig(configUrl: string) {
        logger.info(`⬇ Loading config from remote URL: ${configUrl}`);
        import(/* @vite-ignore */ configUrl)
            .then((module) => {
                this.applyConfig(module.default);
            })
            .catch((e) => {
                logger.error("Error fetching config", e);
            });
    }

    // Private method to apply the configuration to the library.
    private applyConfig(config: AdvantageConfig) {
        this.config = config;
        if (config.formats) {
            this.mergeUniqueFormats(this.defaultFormats, config.formats);
        } else {
            this.formats = new Map(defaultFormats.map((f) => [f.name, f]));
        }
        logger.info("Format configurations applied ✅", this.formats);
        if (config.formatIntegrations) {
            for (const integration of config.formatIntegrations) {
                this.formatIntegrations.set(integration.format, integration);
            }
            logger.info(
                "Format integrations applied ✅",
                this.formatIntegrations
            );
        }

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

    // Private helper method to merge the default formats with the user provided formats.
    private mergeUniqueFormats(
        localFormats: AdvantageFormat[],
        userFormats: AdvantageFormat[]
    ): AdvantageFormat[] {
        const mergedArray = [...localFormats, ...userFormats];
        const formatsMap = new Map<string, AdvantageFormat>();
        for (const item of mergedArray) {
            formatsMap.set(item.name, item);
        }
        this.formats = formatsMap;
        return Array.from(formatsMap.values());
    }
}
