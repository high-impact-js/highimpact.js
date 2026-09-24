/**
 * @fileoverview High Impact JS Compatibility Layer for Advantage
 *
 * This module provides a compatibility layer that allows existing High Impact JS users
 * to transition easily to Advantage. It maintains the core High Impact JS API
 * while internally using Advantage's AdvantageWrapper system.
 *
 * Core features supported:
 * - defineSlot() API for slot configuration
 * - setConfig() for global settings
 * - setTemplateConfig() for template-specific options
 * - waitForAdSignal support for creative communication
 * - Plugin system for GAM and Xandr integration
 * - Async command queue (cmd.push)
 */

import { AdvantageFormatName } from "../../types";
import { GAMPlugin } from "./plugins/gam";
import { XandrPlugin } from "./plugins/xandr";
import {
    CompatibilityPlugin,
    SlotConfig,
    TemplateConfig,
    GlobalConfig
} from "./types";
import logger from "../../utils/logging";
import { getSharedState } from "../runtime";
import { registerCompatibilityLayer } from "../compatibility-registry";

/**
 * Internal state object to store slot configurations
 */
const state = getSharedState("compatibility-state", () => ({
    slots: {} as Record<string, SlotConfig>,
    plugins: {} as Record<string, CompatibilityPlugin>,
    config: {} as GlobalConfig,
    templateConfig: {} as Record<string, TemplateConfig>,
    initialized: false,
    listening: false,
    pluginsReady: false,
    pluginSetupInProgress: false, // Prevent multiple simultaneous plugin setups
    messageQueue: [] as Array<{
        source?: Window;
        adMessageData?: any;
        iframeName?: string;
    }>
}));

/**
 * Maps High Impact JS template names to Advantage format names
 */
const TEMPLATE_TO_FORMAT_MAP: Record<string, AdvantageFormatName> = {
    topscroll: AdvantageFormatName.TopScroll,
    midscroll: AdvantageFormatName.Midscroll,
    "double-fullscreen": AdvantageFormatName.DoubleMidscroll
};

/**
 * Test tag injection utility for testing purposes
 */
const injectTestTagInAdWrapper = (
    containerElement: HTMLElement,
    config: Partial<SlotConfig> = {}
): void => {
    try {
        const iframe = containerElement.querySelector(
            "iframe"
        ) as HTMLIFrameElement;
        if (!iframe || !config.testTagToBeInserted) return;

        const iframeContent =
            iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeContent) return;

        // Hide existing content
        for (const child of Array.from(iframeContent.body.children)) {
            (child as HTMLElement).style.display = "none";
        }

        // Create temporary container and parse HTML
        const tmp = document.createElement("div");
        tmp.innerHTML = config.testTagToBeInserted;

        // Append content (simplified version without script handling)
        iframeContent.body.append(...Array.from(tmp.childNodes));
    } catch (e) {
        logger.debug(
            "Error injecting test tag - possibly because of cross-origin restrictions or safe frame",
            e
        );
    }
};

/**
 * Checks if a slot should be ignored based on HTML content
 */
const shouldIgnore = (html: string): boolean => {
    if (state.config.ignoreSlotOn) {
        return state.config.ignoreSlotOn(html);
    }
    return false;
};

/**
 * Converts High Impact JS template config to Advantage format options
 * This is a simplified mapping focused on the most important options
 */
const convertTemplateConfigToFormatOptions = (
    template: string,
    templateConfig: TemplateConfig,
    _globalConfig: GlobalConfig
) => {
    const options: any = {};

    switch (template) {
        case "topscroll":
            if (templateConfig.showCloseButton !== undefined) {
                options.closeButton = templateConfig.showCloseButton;
            }
            if (templateConfig.title) {
                options.closeButtonText = templateConfig.title;
            }
            if (templateConfig.peekAmount) {
                const match = templateConfig.peekAmount.match(/(\d+)(vh|%)/);
                if (match) {
                    options.height = parseInt(match[1]);
                }
            }
            options.downArrow = true;
            break;

        case "midscroll":
            if (templateConfig.peekAmount) {
                const match = templateConfig.peekAmount.match(/(\d+)(vh|%)/);
                if (match) {
                    options.height = parseInt(match[1]);
                }
            }
            break;

        default:
            // For other templates, use minimal options
            break;
    }

    // Apply z-index from template config or global config (matches original High Impact JS behavior)
    const zIndex = templateConfig.zIndex || _globalConfig.zIndex;
    if (zIndex !== undefined) {
        options.zIndex = zIndex;
    }

    return options;
};

/**
 * Adds High Impact JS CSS classes to elements when an ad format is rendered
 */
const setDivClasses = (
    elements: {
        adWrapper?: HTMLElement;
        adUnit?: HTMLElement;
        adIframe?: HTMLElement;
    },
    templateName: string
): void => {
    if (elements.adWrapper) {
        elements.adWrapper.classList.add(
            `high-impact-ad-wrapper-${templateName}`
        );
    }
    if (elements.adUnit) {
        elements.adUnit.classList.add(`high-impact-ad-unit-${templateName}`);
    }
    if (elements.adIframe) {
        elements.adIframe.classList.add(
            `high-impact-ad-iframe-${templateName}`
        );
    }
    document.body.classList.add("high-impact-ad-rendered");
};

/**
 * Removes High Impact JS CSS classes from elements when cleaning up
 */
const removeDivClasses = (
    elements: {
        adWrapper?: HTMLElement;
        adUnit?: HTMLElement;
        adIframe?: HTMLElement;
    },
    templateName: string
): void => {
    if (elements.adWrapper) {
        elements.adWrapper.classList.remove(
            `high-impact-ad-wrapper-${templateName}`
        );
    }
    if (elements.adUnit) {
        elements.adUnit.classList.remove(`high-impact-ad-unit-${templateName}`);
    }
    if (elements.adIframe) {
        elements.adIframe.classList.remove(
            `high-impact-ad-iframe-${templateName}`
        );
    }
};

/**
 * Sets up template-specific behavior (classes, observers) that the original
 * High Impact JS templates apply in their onRender functions.
 * Returns a cleanup function to be called on destroy.
 */
const setupTemplateSpecificBehavior = (
    templateName: string,
    adWrapper?: HTMLElement
): (() => void) | null => {
    if (templateName === "topscroll") {
        document.body.classList.add("high-impact-topscroll-rendered");

        let observer: IntersectionObserver | null = null;
        if (adWrapper) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.intersectionRatio === 0) {
                            document.body.classList.add(
                                "high-impact-topscroll-is-hidden"
                            );
                        } else {
                            document.body.classList.remove(
                                "high-impact-topscroll-is-hidden"
                            );
                        }
                    });
                },
                {
                    threshold: Array.from({ length: 101 }, (_, i) => i / 100)
                }
            );
            observer.observe(adWrapper);
        }

        return () => {
            document.body.classList.remove("high-impact-topscroll-rendered");
            document.body.classList.remove("high-impact-topscroll-is-hidden");
            if (observer) {
                observer.disconnect();
            }
        };
    }

    return null;
};

/**
 * Calculates and applies negative margins to the advantage-wrapper element
 * so it breaks out of its content container to span the full viewport width.
 * This replicates the margin correction that live HI-JS applies to midscroll ads.
 *
 * The margin properties are tracked in appliedStyleProperties for automatic
 * cleanup by observeWrapperForClose.
 */
const applyMidscrollMargins = (
    wrapperElement: HTMLElement,
    appliedStyleProperties: string[]
): void => {
    const rect = wrapperElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(wrapperElement);
    const currentMarginLeft = parseInt(computedStyle.marginLeft, 10) || 0;
    const currentMarginRight = parseInt(computedStyle.marginRight, 10) || 0;

    // The horizontal offset is the element's distance from the viewport edge,
    // excluding any margin already applied
    const offsetLeft = rect.left - currentMarginLeft;
    const offsetRight =
        document.documentElement.clientWidth - rect.right - currentMarginRight;

    if (offsetLeft > 0 || offsetRight > 0) {
        wrapperElement.style.setProperty(
            "margin-left",
            `-${offsetLeft}px`,
            "important"
        );
        wrapperElement.style.setProperty(
            "margin-right",
            `-${offsetRight}px`,
            "important"
        );
        appliedStyleProperties.push("margin-left", "margin-right");

        logger.debug(
            `[High Impact Compatibility] Applied midscroll margins: left=-${offsetLeft}px, right=-${offsetRight}px`
        );
    }
};

/**
 * Observes the advantage-wrapper element for close/reset events by watching
 * the `current-format` attribute. When the attribute is removed (indicating
 * the format was closed or reset), runs full cleanup of High Impact JS classes
 * and template-specific behavior.
 */
const observeWrapperForClose = (
    wrapperElement: HTMLElement,
    config: SlotConfig,
    elements: {
        adWrapper?: HTMLElement;
        adUnit?: HTMLElement;
        adIframe?: HTMLElement;
    },
    appliedStyleProperties: string[]
): (() => void) => {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "current-format" &&
                !wrapperElement.hasAttribute("current-format")
            ) {
                logger.debug(
                    `[High Impact Compatibility] Wrapper closed/reset for ${config.adUnitId}, cleaning up classes`
                );
                if (config.template) {
                    removeDivClasses(elements, config.template);
                    document.body.classList.remove("high-impact-ad-rendered");
                }
                if (config.rendered?.cleanupTemplateSpecific) {
                    config.rendered.cleanupTemplateSpecific();
                }
                // Remove only the style properties that the compatibility layer added
                for (const prop of appliedStyleProperties) {
                    wrapperElement.style.removeProperty(prop);
                }
                config.rendered = false;
                observer.disconnect();
            }
        }
    });

    observer.observe(wrapperElement, {
        attributes: true,
        attributeFilter: ["current-format"]
    });

    return () => observer.disconnect();
};

/**
 * Handles when an ad slot is rendered
 */
const onAdSlotRendered = (options: {
    elementId: string;
    plugin: string;
    fromAdResponsiveSignal?: boolean;
    adIframe?: HTMLElement;
    adWrapper?: HTMLElement;
    adUnit?: HTMLElement;
    size?: [number, number];
    html?: string;
    adMessageData?: any;
}) => {
    const {
        elementId,
        plugin,
        fromAdResponsiveSignal = false,
        adIframe,
        adWrapper,
        adUnit,
        size,
        html
    } = options;

    logger.debug(
        `[High Impact Compatibility] Ad slot rendered: ${elementId} via ${plugin}`
    );

    const config = getSlotConfig(elementId);
    if (!config) {
        logger.debug(
            `[High Impact Compatibility] No config found for ${elementId}`
        );
        return;
    }

    // Check if already rendered
    if (config.rendered) {
        if (fromAdResponsiveSignal) {
            logger.debug(
                `[High Impact Compatibility] Already rendered ${elementId} - skipping`
            );
            return;
        } else {
            logger.debug(
                `[High Impact Compatibility] Already rendered ${elementId} - cleaning up`
            );
            removeDivClasses({ adWrapper, adUnit, adIframe }, config.template!);
            if (config.rendered.cleanupTemplateSpecific) {
                config.rendered.cleanupTemplateSpecific();
            }
            if (config.rendered.destroy) {
                config.rendered.destroy();
            }
            config.rendered = false;
        }
    } else {
        // Inject test tag if specified
        if (adWrapper) {
            injectTestTagInAdWrapper(adWrapper, config);
        }
    }

    // Check if size matches config
    if (config.sizes && config.sizes.length > 0) {
        const sizeExistInConfig = config.sizes.some(
            (s) => JSON.stringify(s) === JSON.stringify(size)
        );
        if (!sizeExistInConfig) {
            logger.debug(
                `[High Impact Compatibility] Size ${size} not in config for ${elementId}`
            );
            return;
        }
    }

    // Check if we should wait for ad signal
    if (config.waitForAdSignal && !fromAdResponsiveSignal) {
        logger.debug(
            `[High Impact Compatibility] Waiting for ad signal for ${elementId}`
        );
        return;
    }

    // Check if we should ignore this slot
    if (html && shouldIgnore(html)) {
        logger.debug(
            `[High Impact Compatibility] Ignoring slot ${elementId} based on HTML content`
        );
        return;
    }

    // If no template specified, skip (slots without templates remain as regular banners)
    if (!config.template) {
        logger.debug(
            `[High Impact Compatibility] No template specified for ${elementId} - remaining as regular banner`
        );
        return;
    }

    // Get the Advantage format name
    const advantageFormat = TEMPLATE_TO_FORMAT_MAP[config.template];
    if (!advantageFormat) {
        logger.debug(
            `[High Impact Compatibility] Unknown template: ${config.template}`
        );
        return;
    }

    // Get template configuration
    const templateConfig = getTemplateConfig(config.template);
    const globalConfig = getConfig();
    const formatOptions = convertTemplateConfigToFormatOptions(
        config.template,
        templateConfig,
        globalConfig
    );

    logger.debug(
        `[High Impact Compatibility] Converting ${config.template} to ${advantageFormat} (size: ${size})`
    );

    try {
        // Check if this ad unit was pre-wrapped
        let wrapper: any = null;
        let advantageWrapperElement: HTMLElement | null = null;

        if (config.preWrapped && config.wrapperElement) {
            // Use the pre-wrapped element
            advantageWrapperElement = config.wrapperElement;
            wrapper = (advantageWrapperElement as any).advantageWrapper;

            logger.debug(
                `[High Impact Compatibility] Using pre-wrapped element for ${elementId}`
            );
        } else {
            // Check if there's already a wrapper in the DOM
            wrapper = (adWrapper as any).advantageWrapper;
        }

        const onFormatApplied = (
            activeWrapper: any,
            wrapperEl: HTMLElement | null
        ) => {
            logger.debug(
                `[High Impact Compatibility] Successfully applied ${advantageFormat} format`
            );

            setDivClasses({ adWrapper, adUnit, adIframe }, config.template!);

            const appliedStyleProperties: string[] = [];
            if (formatOptions.zIndex && wrapperEl) {
                wrapperEl.style.zIndex = String(formatOptions.zIndex);
                appliedStyleProperties.push("z-index");
            }

            if (config.template === "midscroll" && wrapperEl) {
                applyMidscrollMargins(wrapperEl, appliedStyleProperties);
            }

            const cleanupTemplateSpecific = setupTemplateSpecificBehavior(
                config.template!,
                adWrapper
            );

            config.rendered = {
                wrapper: activeWrapper,
                cleanupTemplateSpecific,
                destroy: () => {
                    cleanupTemplateSpecific?.();
                    activeWrapper?.reset();
                }
            };

            if (wrapperEl) {
                observeWrapperForClose(
                    wrapperEl,
                    config,
                    { adWrapper, adUnit, adIframe },
                    appliedStyleProperties
                );
            }

            window.dispatchEvent(
                new CustomEvent("high-impact-ad-rendered", {
                    detail: {
                        size: {
                            width: adIframe?.clientWidth || size?.[0] || 0,
                            height: adIframe?.clientHeight || size?.[1] || 0
                        },
                        template: config.template,
                        advantageFormat
                    }
                })
            );
        };

        const onFormatError = (error: any) => {
            logger.error(
                `[High Impact Compatibility] Failed to apply format: ${error}`
            );
        };

        if (!wrapper) {
            if (!advantageWrapperElement) {
                advantageWrapperElement =
                    document.createElement("advantage-wrapper");
                const slotDiv = document.createElement("div");
                slotDiv.setAttribute("slot", "advantage-ad-slot");

                // Move the ad iframe into the advantage wrapper
                if (adIframe) {
                    slotDiv.appendChild(adIframe);
                }
                advantageWrapperElement.appendChild(slotDiv);

                // Replace the original ad wrapper with advantage wrapper
                if (adWrapper) {
                    adWrapper.parentNode?.replaceChild(
                        advantageWrapperElement,
                        adWrapper
                    );
                }
            }

            // Wait for the custom element to be defined and upgraded
            customElements.whenDefined("advantage-wrapper").then(() => {
                wrapper = (advantageWrapperElement as any).advantageWrapper;
                if (wrapper) {
                    wrapper
                        .forceFormat(advantageFormat, adIframe, formatOptions)
                        .then(() =>
                            onFormatApplied(wrapper, advantageWrapperElement)
                        )
                        .catch(onFormatError);
                } else {
                    logger.debug(
                        `[High Impact Compatibility] No wrapper instance found after custom element definition`
                    );
                }
            });
        } else {
            const wrapperEl = config.wrapperElement || advantageWrapperElement;
            wrapper
                .forceFormat(advantageFormat, adIframe, formatOptions)
                .then(() => onFormatApplied(wrapper, wrapperEl))
                .catch(onFormatError);
        }
    } catch (error) {
        logger.error(
            `[High Impact Compatibility] Error processing ad slot: ${error}`
        );
    }
};

/**
 * Pre-wraps an ad unit with AdvantageWrapper based on slot configuration
 * This ensures Advantage creatives can communicate immediately when they load
 */
const preWrapAdUnit = (slotConfig: SlotConfig): void => {
    // Try immediate wrapping first
    if (attemptPreWrap(slotConfig)) {
        return;
    }

    // If DOM element not found, set up observers and retries
    setupDeferredWrapping(slotConfig);
};

/**
 * Attempts to pre-wrap an ad unit immediately
 */
const attemptPreWrap = (slotConfig: SlotConfig): boolean => {
    const adUnitElement = findAdUnitElement(slotConfig.adUnitId);

    if (!adUnitElement) {
        return false;
    }

    // Check if already wrapped - important to prevent double-wrapping
    // when both Advantage and High Impact JS compatibility layer are present
    const existingWrapper = adUnitElement.closest("advantage-wrapper");
    if (existingWrapper) {
        logger.debug(
            `[High Impact Compatibility] Ad unit ${slotConfig.adUnitId} already wrapped`
        );
        slotConfig.preWrapped = true;
        slotConfig.wrapperElement = existingWrapper as HTMLElement;
        return true;
    }

    // Skip pre-wrapping if no template specified
    if (!slotConfig.template) {
        logger.debug(
            `[High Impact Compatibility] No template specified for ${slotConfig.adUnitId}, skipping pre-wrap`
        );
        return false;
    }

    // Get allowed formats for this template
    const advantageFormat = TEMPLATE_TO_FORMAT_MAP[slotConfig.template];
    if (!advantageFormat) {
        logger.debug(
            `[High Impact Compatibility] Unknown template: ${slotConfig.template}, cannot pre-wrap`
        );
        return false;
    }

    try {
        // Create advantage wrapper
        const advantageWrapperElement =
            document.createElement("advantage-wrapper");

        // Set allowed formats to restrict to only the configured template
        advantageWrapperElement.setAttribute(
            "allowed-formats",
            advantageFormat
        );

        // Create slot div
        const slotDiv = document.createElement("div");
        slotDiv.setAttribute("slot", "advantage-ad-slot");

        // Move the ad unit into the wrapper
        const parent = adUnitElement.parentNode;
        if (parent) {
            parent.insertBefore(advantageWrapperElement, adUnitElement);
            slotDiv.appendChild(adUnitElement);
            advantageWrapperElement.appendChild(slotDiv);

            logger.debug(
                `[High Impact Compatibility] Pre-wrapped ad unit ${slotConfig.adUnitId} with AdvantageWrapper for template ${slotConfig.template}`
            );

            // Store reference to wrapper in slot config for later use
            slotConfig.preWrapped = true;
            slotConfig.wrapperElement = advantageWrapperElement;
            return true;
        } else {
            logger.error(
                `[High Impact Compatibility] Ad unit ${slotConfig.adUnitId} has no parent node`
            );
        }
    } catch (error) {
        logger.error(
            `[High Impact Compatibility] Failed to pre-wrap ad unit ${slotConfig.adUnitId}:`,
            error
        );
    }

    return false;
};

/**
 * Sets up deferred wrapping using MutationObserver and periodic retries
 */
const setupDeferredWrapping = (slotConfig: SlotConfig): void => {
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 500; // 500ms

    const retryWrapping = () => {
        if (retryCount >= maxRetries) {
            logger.debug(
                `[High Impact Compatibility] Max retries reached for ${slotConfig.adUnitId}, will wrap when rendered`
            );
            return;
        }

        if (attemptPreWrap(slotConfig)) {
            return; // Successfully wrapped
        }

        retryCount++;
        setTimeout(retryWrapping, retryInterval);
    };

    // Set up MutationObserver to watch for DOM changes
    if (typeof window !== "undefined" && window.MutationObserver) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === "childList" &&
                    mutation.addedNodes.length > 0
                ) {
                    if (attemptPreWrap(slotConfig)) {
                        observer.disconnect();
                        return;
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Clean up observer after max retries
        setTimeout(() => {
            observer.disconnect();
        }, maxRetries * retryInterval);
    }

    // Also start periodic retries
    setTimeout(retryWrapping, retryInterval);
};

/**
 * Attempts to find the ad unit element in the DOM
 */
const findAdUnitElement = (adUnitId: string): HTMLElement | null => {
    // Try multiple common patterns for ad unit identification
    const selectors = [
        `#${adUnitId}`,
        `[data-ad-unit="${adUnitId}"]`,
        `[data-ad-unit-id="${adUnitId}"]`,
        `[data-google-ad-unit="${adUnitId}"]`,
        `[data-adunit="${adUnitId}"]`,
        `div[id*="${adUnitId}"]`
    ];

    for (const selector of selectors) {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
                logger.debug(
                    `[High Impact Compatibility] Found ad unit element using selector: ${selector}`
                );
                return element;
            }
        } catch (error) {
            // Invalid selector, continue to next
        }
    }

    return null;
};

/**
 * Defines a new ad slot with the specified configuration
 */
export const defineSlot = (slotConfig: SlotConfig): void => {
    const globalConfig = getConfig();

    // Handle Xandr integration by mapping targetId to adUnitId
    if (globalConfig.plugins && globalConfig.plugins[0] === "xandr") {
        slotConfig.adUnitId = slotConfig.targetId || slotConfig.adUnitId;
    }

    const key = `${slotConfig.adUnitId}`;
    state.slots[key] = slotConfig;

    // Pre-wrap the ad unit with AdvantageWrapper to ensure Advantage creatives
    // can communicate immediately when they load
    preWrapAdUnit(slotConfig);

    logger.debug(
        `[High Impact Compatibility] Slot defined: ${key}`,
        slotConfig
    );
};

/**
 * Command queue handler for asynchronous execution
 */
export const cmd = {
    push: (command: () => void): void => {
        if (typeof command === "function") {
            command();
        }
    }
};

/**
 * Sets the visibility of the top bar
 */
export const setTopBarVisibility = (isVisible: boolean): void => {
    const root = document.querySelector(":root") as HTMLElement;
    if (root) {
        root.style.setProperty(
            "--high-impact-top-bar-display",
            isVisible ? "flex" : "none"
        );
    }
};

/**
 * Gets the configuration for a specific slot
 */
export const getSlotConfig = (elementId: string): SlotConfig | undefined => {
    const key = `${elementId}`;
    return state.slots[key] ?? undefined;
};

/**
 * Sets the configuration for a specific template
 */
export const setTemplateConfig = (
    template: string,
    config: TemplateConfig
): void => {
    logger.debug(
        `[High Impact Compatibility] Template config set for ${template}`,
        config
    );

    state.templateConfig[template] = config;

    // Apply template config retroactively to existing slots
    applyTemplateConfigToExistingSlots(template, config);
};

/**
 * Apply template configuration to existing slots that use this template
 */
const applyTemplateConfigToExistingSlots = (
    template: string,
    templateConfig: TemplateConfig
): void => {
    logger.debug(
        `[High Impact Compatibility] Applying template config retroactively to existing ${template} slots`
    );

    // Find all slots that use this template
    Object.values(state.slots).forEach((slotConfig) => {
        if (
            slotConfig.template === template &&
            slotConfig.preWrapped &&
            slotConfig.wrapperElement
        ) {
            logger.debug(
                `[High Impact Compatibility] Updating pre-wrapped slot ${slotConfig.adUnitId} with new ${template} config`
            );

            const wrapper = (slotConfig.wrapperElement as any).advantageWrapper;
            if (wrapper) {
                // Convert template config to format options
                const advantageFormat = TEMPLATE_TO_FORMAT_MAP[template];
                if (advantageFormat) {
                    const globalConfig = getConfig();
                    const formatOptions = convertTemplateConfigToFormatOptions(
                        template,
                        templateConfig,
                        globalConfig
                    );

                    // Re-apply the format with new options
                    const adIframe =
                        slotConfig.wrapperElement.querySelector("iframe");
                    if (adIframe) {
                        wrapper
                            .forceFormat(
                                advantageFormat,
                                adIframe,
                                formatOptions
                            )
                            .then(() => {
                                logger.debug(
                                    `[High Impact Compatibility] Retroactive format applied to ${slotConfig.adUnitId}`
                                );
                            })
                            .catch((error: any) => {
                                logger.error(
                                    `[High Impact Compatibility] Failed to apply retroactive format options to ${slotConfig.adUnitId}:`,
                                    error
                                );
                            });
                    } else {
                        // No iframe yet, but wrapper exists - apply format without iframe
                        wrapper
                            .forceFormat(
                                advantageFormat,
                                undefined,
                                formatOptions
                            )
                            .then(() => {
                                logger.debug(
                                    `[High Impact Compatibility] Retroactive format applied to ${slotConfig.adUnitId} (no iframe)`
                                );
                            })
                            .catch((error: any) => {
                                logger.error(
                                    `[High Impact Compatibility] Failed to apply retroactive format options to ${slotConfig.adUnitId}:`,
                                    error
                                );
                            });
                    }
                }
            }
        }
    });
};

/**
 * Gets the configuration for a specific template
 */
export const getTemplateConfig = (template: string): TemplateConfig => {
    return state.templateConfig[template] || {};
};

/**
 * Sets the global configuration
 */
export const setConfig = (config: GlobalConfig): void => {
    state.config = { ...state.config, ...config };
    logger.debug(`[High Impact Compatibility] Global config set`, state.config);
};

/**
 * Gets the global configuration
 */
export const getConfig = (): GlobalConfig => {
    return state.config;
};

/**
 * Imports and sets up plugins
 */
const setupPlugins = async (
    plugins: string[] = []
): Promise<Record<string, CompatibilityPlugin>> => {
    // Prevent multiple simultaneous plugin setups
    if (state.pluginSetupInProgress) {
        return state.plugins;
    }

    // If plugins are already ready, return them immediately
    if (state.pluginsReady) {
        return state.plugins;
    }

    state.pluginSetupInProgress = true;
    const imported: Record<string, CompatibilityPlugin> = {};

    for (const pluginName of plugins) {
        try {
            let plugin: CompatibilityPlugin;

            switch (pluginName.toLowerCase()) {
                case "gam":
                    plugin = new GAMPlugin();
                    break;
                case "xandr":
                    plugin = new XandrPlugin();
                    break;
                default:
                    logger.debug(
                        `[High Impact Compatibility] Unknown plugin: ${pluginName}`
                    );
                    continue;
            }

            imported[pluginName] = plugin;

            // Initialize the plugin
            if (plugin.init) {
                plugin.init();
            }

            // Set up ad slot rendered handler
            if (plugin.onAdSlotRendered) {
                plugin.onAdSlotRendered(onAdSlotRendered);
            }

            // REMOVED: getRenderedSlots() call - was causing 4-second delay
            // This async operation was the bottleneck causing slow initialization

            logger.debug(
                `[High Impact Compatibility] Plugin ${pluginName} imported and initialized successfully`
            );
        } catch (error) {
            logger.error(
                `[High Impact Compatibility] Failed to import plugin ${pluginName}:`,
                error
            );
        }
    }

    // Assign plugins to state BEFORE processing queued messages
    state.plugins = imported;

    // Mark plugins as ready and process any queued messages
    state.pluginsReady = true;
    state.pluginSetupInProgress = false; // Reset the flag
    logger.debug(
        `[High Impact Compatibility] Plugins ready:`,
        Object.keys(imported)
    );
    processQueuedMessages();

    return imported;
};

/**
 * Core message processing logic (extracted to avoid duplication)
 */
const processHighImpactMessage = (options: {
    source?: Window;
    adMessageData?: any;
    iframeName?: string;
}) => {
    const { adMessageData } = options;

    for (const [, plugin] of Object.entries(state.plugins)) {
        let slot;
        if (plugin.getSlotFromSource && options?.source) {
            slot = plugin.getSlotFromSource(options.source);
        }

        if (slot) {
            onAdSlotRendered({
                ...slot,
                fromAdResponsiveSignal: true,
                adMessageData
            });
        }
    }

    // Original High Impact JS approach: if no plugin found a slot, we're done
    // The plugins handle all the validation and iframe matching
};

/**
 * Processes any queued messages after plugins are ready
 */
const processQueuedMessages = () => {
    if (state.messageQueue.length > 0) {
        const queuedMessages = [...state.messageQueue];
        state.messageQueue = []; // Clear the queue

        queuedMessages.forEach((message) => {
            processHighImpactMessage(message);
        });
    }
};

/**
 * Handles ad responsive signal from post messages
 */
const onAdResponsiveSignal = (options: {
    source?: Window;
    adMessageData?: any;
    iframeName?: string;
}) => {
    // Ultra-fast path: If plugins are ready, process immediately
    if (state.pluginsReady) {
        processHighImpactMessage(options);
        return;
    }

    // Fallback: If plugins aren't ready yet, queue this message
    state.messageQueue.push(options);
};

/**
 * Sets up post message listeners for ad responsive signals
 */
const listenToHighImpactPostMessages = (handler: (options: any) => void) => {
    window.addEventListener("message", (event) => {
        // Silently check message formats without logging every message
        let isValidMessage = false;
        let messageData = event.data;

        // Support both original High Impact JS format and new format
        if (event.data && event.data.type === "high-impact-ad-responsive") {
            // New format
            isValidMessage = true;
        } else if (typeof event.data === "string") {
            // Original High Impact JS format (JSON string)
            try {
                const data = JSON.parse(event.data);
                if (
                    data.sender === "high-impact-js" &&
                    data.action === "AD_RENDERED"
                ) {
                    isValidMessage = true;
                    messageData = data;
                }
            } catch (e) {
                // Not a valid JSON string, silently ignore
            }
        } else if (
            event.data &&
            typeof event.data === "object" &&
            event.data.sender === "high-impact-js" &&
            event.data.action === "AD_RENDERED"
        ) {
            // Original High Impact JS format (object)
            isValidMessage = true;
        }

        // Only process and log valid messages
        if (isValidMessage) {
            let iframeName;
            try {
                iframeName = (event.source as any)?.name;
            } catch (_) {}

            handler({
                source: event.source,
                iframeName: iframeName,
                adMessageData: messageData
            });
        }
        // Silently ignore invalid messages - no logging for non-High Impact JS messages
    });
};

/**
 * Initialize the High Impact JS compatibility layer
 */
export const initializeHighImpactJs = async (): Promise<void> => {
    if (state.initialized) {
        logger.debug("[High Impact Compatibility] Already initialized");
        return;
    }

    logger.debug("[High Impact Compatibility] Initializing...");
    state.initialized = true;

    // Set up global window object
    (window as any).highImpactJs = (window as any).highImpactJs || { cmd: [] };

    const highImpactJs = (window as any).highImpactJs;

    // Assign API functions
    highImpactJs.defineSlot = defineSlot;
    highImpactJs.setTemplateConfig = setTemplateConfig;
    highImpactJs.setConfig = setConfig;

    // Expose state properties for debugging and compatibility
    highImpactJs.initialized = true;
    highImpactJs.config = state.config;
    highImpactJs.slots = state.slots;

    // Expose helper function for mock GAM to trigger slot rendered events
    highImpactJs._triggerSlotRendered = onAdSlotRendered;

    // Own the pending commands before awaiting any of them. The full entry or
    // another bundle can publish cmd while an asynchronous command is pending.
    const pendingCommands = Array.isArray(highImpactJs.cmd)
        ? highImpactJs.cmd.splice(0)
        : [];
    highImpactJs.cmd = cmd;
    for (const item of pendingCommands) {
        if (typeof item === "function") {
            await item();
        }
    }

    // Set default plugins if not configured
    if (!state.config.plugins) {
        state.config.plugins = ["gam", "xandr"];
    }

    // Set up plugins (skip if already initialized by pre-init)
    if (state.config.plugins && !state.pluginsReady) {
        await setupPlugins(state.config.plugins);
    } else if (state.pluginsReady) {
        // Plugins already pre-initialized, skip
    }

    logger.debug("[High Impact Compatibility] Initialization complete");
};

registerCompatibilityLayer({
    initialize: initializeHighImpactJs,
    getConfig
});

// Set up message listener immediately when module loads (not waiting for full init)
if (typeof window !== "undefined" && !state.listening) {
    state.listening = true;
    listenToHighImpactPostMessages(onAdResponsiveSignal);

    // Pre-initialize plugins with default configuration for speed (GAM only for now)
    setupPlugins(["gam"])
        .then(() => {
            logger.debug(
                "[High Impact Compatibility] Plugin pre-initialization complete"
            );
        })
        .catch((error) => {
            console.warn(
                "[High Impact Compatibility] Plugin pre-initialization failed:",
                error
            );
        });
}

// Export a reset function for testing
export const resetState = () => {
    state.initialized = false;
    state.config = {};
    state.slots = {};
    state.templateConfig = {};
    state.plugins = {};
};
