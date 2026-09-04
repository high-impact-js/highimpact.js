export * from "./core";
import logger from "../utils/logging";
export * from "./high-impact-js";

// Also import Advantage class for internal use
import { Advantage } from "./advantage";

// Import High Impact JS API functions for direct export
import {
    defineSlot as _defineSlot,
    setConfig as _setConfig,
    setTemplateConfig as _setTemplateConfig,
    getSlotConfig,
    getTemplateConfig,
    getConfig,
    cmd,
    initializeHighImpactJs
} from "./high-impact-js";

// Create auto-initializing wrappers for the High Impact JS API
let autoInitialized = false;

const ensureAutoInit = (): void => {
    if (!autoInitialized) {
        autoInitialized = true;
        logger.debug(
            "Auto-initializing Advantage with High Impact JS compatibility"
        );

        // Ensure Advantage is configured with High Impact JS compatibility
        const advantage = Advantage.getInstance();
        if (!advantage.config) {
            // Configure with minimal defaults that enable High Impact JS compatibility
            advantage.configure({
                enableHighImpactCompatibility: true
            });
        } else if (!advantage.config.enableHighImpactCompatibility) {
            // If already configured but without High Impact JS compatibility, initialize it manually
            initializeHighImpactJs().catch((error) => {
                logger.error(
                    "Auto-initialization of High Impact JS failed:",
                    error
                );
            });
        }

        // Always initialize High Impact JS compatibility layer (regardless of Advantage config)
        initializeHighImpactJs().catch((error) => {
            logger.error(
                "Auto-initialization of High Impact JS failed:",
                error
            );
        });
    }
};

// Auto-initializing wrapper functions (keeping them synchronous for compatibility)
export const defineSlot = (...args: Parameters<typeof _defineSlot>) => {
    ensureAutoInit();
    return _defineSlot(...args);
};

export const setConfig = (...args: Parameters<typeof _setConfig>) => {
    ensureAutoInit();
    return _setConfig(...args);
};

export const setTemplateConfig = (
    ...args: Parameters<typeof _setTemplateConfig>
) => {
    ensureAutoInit();
    return _setTemplateConfig(...args);
};

// Export other functions directly (they don't require initialization)
export {
    getSlotConfig,
    getTemplateConfig,
    getConfig,
    cmd,
    initializeHighImpactJs
};

// Auto-initialize High Impact JS compatibility if window.highImpactJs is detected
if (typeof window !== "undefined" && (window as any).highImpactJs) {
    logger.debug(
        "Detected window.highImpactJs - auto-initializing High Impact JS compatibility"
    );
    initializeHighImpactJs().catch((error) => {
        logger.error(
            "Failed to auto-initialize High Impact JS compatibility:",
            error
        );
    });
}

// Also expose High Impact JS API globally for maximum compatibility
if (typeof window !== "undefined") {
    // Set up the global highImpactJs object if it doesn't exist
    (window as any).highImpactJs = (window as any).highImpactJs || { cmd: [] };

    // Expose the auto-initializing API functions globally
    const globalHighImpactJs = (window as any).highImpactJs;
    globalHighImpactJs.defineSlot = defineSlot;
    globalHighImpactJs.setConfig = setConfig;
    globalHighImpactJs.setTemplateConfig = setTemplateConfig;
    globalHighImpactJs.getSlotConfig = getSlotConfig;
    globalHighImpactJs.getTemplateConfig = getTemplateConfig;
    globalHighImpactJs.getConfig = getConfig;
    globalHighImpactJs.cmd = cmd;

    logger.debug("High Impact JS API exposed globally via window.highImpactJs");
}
