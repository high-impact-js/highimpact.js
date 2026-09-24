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

import { getSharedState } from "./runtime";

// Create auto-initializing wrappers for the High Impact JS API

const installation = getSharedState("full-installation", () => ({
    autoInitialized: false,
    installed: false
}));

const ensureAutoInit = (): void => {
    if (!installation.autoInitialized) {
        installation.autoInitialized = true;
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

if (typeof window !== "undefined" && !installation.installed) {
    installation.installed = true;
    // Auto-initialize compatibility when a publisher has queued commands.
    if ((window as any).highImpactJs) {
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

    (window as any).highImpactJs = (window as any).highImpactJs || { cmd: [] };
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
