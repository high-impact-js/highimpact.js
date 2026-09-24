import { Advantage } from "./advantage";
import { getRegisteredCompatibilityConfig } from "./compatibility-registry";
import {
    AdvantageFormatName,
    AdvantageFormat,
    AdvantageFormatIntegration,
    MergedIntegrationConfig,
    IAdvantageUILayer,
    IAdvantageWrapper,
    AdvantageMessage,
    AdvantageMessageAction
} from "../types";

import {
    logger,
    traverseNodes,
    supportsAdoptingStyleSheets,
    ADVANTAGE
} from "../utils";

import { AdvantageAdSlotResponder } from "./messaging/publisher-side";

/**
 * Represents the AdvantageWrapper class, which extends the HTMLElement class and implements the IAdvantageWrapper interface.
 * This class is responsible for creating and managing the wrapper element for Advantage ads.
 * @noInheritDoc
 */
export class AdvantageWrapper extends HTMLElement implements IAdvantageWrapper {
    // Constants
    static readonly DISCONNECT_TIMEOUT_MS = 100;

    // Private fields
    #styleSheet: CSSStyleSheet | HTMLStyleElement;
    #root: ShadowRoot;
    #slotAdvantageContent: HTMLSlotElement;
    #slotChangeRegistered = false;
    #trackedIframes = new WeakSet<HTMLIFrameElement>();
    #activeFormatIframe: HTMLIFrameElement | null = null;
    #activeLifecycle?: {
        format: AdvantageFormat;
        integration?: AdvantageFormatIntegration;
        config: MergedIntegrationConfig;
    };
    #mutationObserver: MutationObserver | null = null;
    #slotChangeHandler: (() => void) | null = null;
    #disconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    // Whitelist set via attribute or API; when present it overrides exclude‑formats
    allowedFormats: string[] | null = null;
    // Public fields
    container: HTMLDivElement;
    content: HTMLDivElement;
    uiLayer: IAdvantageUILayer;
    currentFormat: AdvantageFormatName | string = "";
    messageHandler: AdvantageAdSlotResponder;
    simulating = false;

    /**
     * Creates an instance of AdvantageWrapper.
     */
    constructor() {
        super();
        if (supportsAdoptingStyleSheets) {
            this.#styleSheet = new CSSStyleSheet();
        } else {
            this.#styleSheet = document.createElement(
                "style"
            ) as HTMLStyleElement;
        }

        this.#root = this.attachShadow({ mode: "open" });

        if (supportsAdoptingStyleSheets) {
            this.#root.adoptedStyleSheets = [this.#styleSheet as CSSStyleSheet];
        } else {
            this.#root.appendChild(this.#styleSheet as HTMLStyleElement);
        }

        // Create the container div
        this.container = document.createElement("div");
        this.container.id = "container";

        // Create the content div
        this.content = document.createElement("div");
        this.content.id = "ad-slot";
        this.content.className = "advantage-ad-slot";

        // Create the first slot, this is for advantage-content
        this.#slotAdvantageContent = document.createElement("slot");
        this.#slotAdvantageContent.name = "advantage-ad-slot";

        // Create the second slot, this is for the ui layer
        const slotOverlay = document.createElement("slot");
        slotOverlay.name = "overlay";

        // Create the advantage-ui-layer element
        this.uiLayer = document.createElement(
            "advantage-ui-layer"
        ) as IAdvantageUILayer;

        // Append the slots and the advantage-overlay to the content div
        this.content.appendChild(this.#slotAdvantageContent);
        this.content.appendChild(slotOverlay);
        this.content.appendChild(this.uiLayer);

        // Append the content div to the container
        this.container.appendChild(this.content);

        // Append the container to the shadow root
        this.#root.append(this.container);

        // Register the wrapper with the hub, so that it is aware of its existence
        Advantage.getInstance().registerWrapper(this);

        // Set the advantageWrapper property for High Impact JS compatibility
        (this as any).advantageWrapper = this;

        this.#slotChangeHandler = () => {
            if (!this.#slotChangeRegistered) {
                logger.info("The content slot has been changed");
                this.#slotChangeRegistered = true;
                return;
            }
            //logger.error("The advantage-content slot should not be changed");
        };
        this.#slotAdvantageContent.addEventListener(
            "slotchange",
            this.#slotChangeHandler
        );
        this.#detectDOMChanges();
        this.messageHandler = new AdvantageAdSlotResponder({
            adSlotElement: this,
            messageValidator: Advantage.getInstance().config?.messageValidator
        });

        // Temporary log for testing the new iframe tracking version
        logger.info(
            "🔍 AdvantageWrapper initialized with ENHANCED iframe tracking (fix/detect-reset branch) 🔍"
        );
    }

    /**
     * Updates the current-format attribute to match the currentFormat property.
     * Sets the attribute when currentFormat has a value, removes it when empty.
     */
    #updateCurrentFormatAttribute() {
        if (this.currentFormat) {
            this.setAttribute("current-format", this.currentFormat);
        } else {
            this.removeAttribute("current-format");
        }
    }

    /**
     * Dispatches a lifecycle CustomEvent that bubbles and crosses Shadow DOM boundaries.
     */
    #dispatchLifecycleEvent(
        eventName: string,
        format: AdvantageFormatName | string,
        iframe?: HTMLElement
    ) {
        this.dispatchEvent(
            new CustomEvent(eventName, {
                bubbles: true,
                composed: true,
                detail: { format, wrapper: this, iframe }
            })
        );
    }

    /**
     * Detects DOM changes and resets the wrapper if a new ad is loaded.
     * Tracks iframes and resets the wrapper when an iframe that requested a format is removed.
     */
    #detectDOMChanges = () => {
        this.#mutationObserver = new MutationObserver((mutations) => {
            // Loop through all mutation records
            mutations.forEach((mutation) => {
                // We only care about added or removed nodes
                if (mutation.type === "childList") {
                    // Check for added nodes
                    mutation.addedNodes.forEach((node) => {
                        // Is this node an iframe?
                        if ((node as Element).tagName === "IFRAME") {
                            const iframe = node as HTMLIFrameElement;
                            logger.debug("An <iframe> was added:", iframe);

                            // Track this iframe
                            this.#trackedIframes.add(iframe);

                            // If we have an active format but the active iframe was replaced,
                            // we need to reset
                            if (
                                this.currentFormat &&
                                this.#activeFormatIframe &&
                                this.#activeFormatIframe !== iframe &&
                                !this.simulating
                            ) {
                                logger.info(
                                    "A new <iframe> was added while a format is active. " +
                                        "The previous iframe may have been replaced. Resetting wrapper."
                                );
                                this.reset();
                            }
                        }
                    });

                    // Check for removed nodes
                    mutation.removedNodes.forEach((node) => {
                        if ((node as Element).tagName === "IFRAME") {
                            const iframe = node as HTMLIFrameElement;

                            // Only reset if this was the iframe that requested a format
                            if (this.#activeFormatIframe === iframe) {
                                if (
                                    this.currentFormat &&
                                    this.simulating === false
                                ) {
                                    logger.debug(
                                        "The active format <iframe> was removed. " +
                                            "This probably means that a new ad was loaded. " +
                                            "Resetting the wrapper."
                                    );
                                    this.reset();
                                }
                            } else if (this.#trackedIframes.has(iframe)) {
                                logger.debug(
                                    "A tracked <iframe> was removed, but it wasn't the active format iframe."
                                );
                            } else {
                                logger.debug(
                                    "An untracked <iframe> was removed."
                                );
                            }
                        }
                    });
                }
            });
        });
        this.#mutationObserver.observe(this, {
            childList: true,
            subtree: true
        });
    };

    /**
     * Gets the content nodes assigned to the advantage-ad-slot.
     * @returns An array of content nodes.
     */
    get contentNodes() {
        return this.#slotAdvantageContent.assignedNodes() ?? [];
    }

    /**
     * Simulates a specific ad format.
     * @param format - The format to simulate.
     */
    simulateFormat = async (format: string) => {
        if (this.simulating) {
            return;
        }
        this.simulating = true;
        const formatConfig = Advantage.getInstance().formats.get(format);
        if (formatConfig && formatConfig.simulate) {
            logger.debug("SIMULATE FORMAT");
            formatConfig.simulate(this);
        }
    };

    /**
     * Restrict this wrapper to the given list of formats.
     * Calling this method overrides any list previously set via attribute or API.
     * @param formats Array of format names that are allowed for this wrapper.
     */
    setAllowedFormats(formats: string[]) {
        this.allowedFormats = formats.map((f) => f.trim().toUpperCase());
    }

    /**
     * Clears the programmatic whitelist so the wrapper falls back to attribute or default behaviour.
     */
    clearAllowedFormats() {
        this.allowedFormats = null;
    }

    /**
     * Morphs the wrapper into a specific ad format.
     * If `allowed-formats` is set (via attribute or API) it takes precedence over `exclude-formats`.
     * Comparisons are case-insensitive.
     * @param format - The format to morph into.
     * @param sessionID - The session ID for the ad.
     * @param backgroundAdURL - The URL for the background ad.
     * @returns A promise that resolves when the morphing is complete.
     */
    morphIntoFormat = async (
        format: AdvantageFormatName | string,
        message?: AdvantageMessage
    ) => {
        logger.debug("MORPH INTO FORMAT");
        return new Promise<void>(async (resolve, reject) => {
            const formatId = format.toUpperCase();
            // 1. Check for an explicit allow‑list (attribute or programmatic).
            const attrAllowed = this.getAttribute("allowed-formats")
                ?.split(",")
                .map((f) => f.trim().toUpperCase())
                .filter(Boolean);
            const allowedList = this.allowedFormats ?? attrAllowed;
            if (allowedList && !allowedList.includes(formatId)) {
                logger.info(
                    `The format "${formatId}" is not in the allowed-formats list (${allowedList.join(
                        ", "
                    )}).`
                );
                reject(
                    `The format ${formatId} is not allowed for this wrapper. 🛑`
                );
                return;
            }

            // 2. If no allow‑list, fall back to exclude‑list logic.
            const forbiddenFormats = !allowedList
                ? this.getAttribute("exclude-formats")
                      ?.split(",")
                      .map((f) => f.trim().toUpperCase())
                : undefined;
            if (forbiddenFormats && forbiddenFormats.includes(formatId)) {
                logger.info(
                    `This wrapper does not support the format(s): "${forbiddenFormats.join(
                        ", "
                    )}".`
                );
                reject(
                    `The format ${formatId} is forbidden for this wrapper. 🛑`
                );
                return;
            }
            // If a format is already active, reset it before applying the new one.
            // This handles the case where a placement is refreshed and a new ad requests
            // a different format before the previous session has been torn down.
            if (this.currentFormat) {
                logger.info(
                    `A new format "${format}" was requested while "${this.currentFormat}" is still active. ` +
                        "Resetting the current format first."
                );
                this.reset();
            }

            this.currentFormat = format;
            this.#updateCurrentFormatAttribute();
            let formatConfig = Advantage.getInstance().formats.get(
                format as string
            );

            if (!formatConfig) {
                formatConfig = Advantage.getInstance().defaultFormats.find(
                    (f) => f.name === format
                );
                if (!formatConfig) {
                    reject(
                        `😱 The format ${format} is not supported. No configuration was found.`
                    );
                    this.currentFormat = "";
                    this.#updateCurrentFormatAttribute();
                    return;
                }
            }

            const integration = Advantage.getInstance().formatIntegrations.get(
                this.currentFormat as string
            );

            try {
                // Track the iframe that is requesting this format
                if (this.messageHandler.ad?.iframe) {
                    this.#activeFormatIframe = this.messageHandler.ad
                        .iframe as HTMLIFrameElement;
                    logger.debug(
                        `Set active format iframe for format: ${format}`,
                        this.#activeFormatIframe
                    );
                }

                // Extract format options from message, excluding control properties
                const messageOptions: any = message ? { ...message } : {};
                delete messageOptions.type;
                delete messageOptions.action;
                delete messageOptions.format;

                // Merge Advantage config with High Impact JS config
                const mergedConfig = {
                    ...Advantage.getInstance().config,
                    ...getRegisteredCompatibilityConfig()
                };

                // Keep the definitions used for this activation even if the
                // publisher replaces or removes them while the ad is active.
                this.#activeLifecycle = {
                    format: formatConfig,
                    integration,
                    config: mergedConfig
                };

                // 1. First we call the format setup function with optional user defined format options
                await formatConfig.setup(this, this.messageHandler.ad?.iframe, {
                    ...integration?.options,
                    ...messageOptions
                });

                // 2. Then we call the integration setup function to apply site-specific adjustments
                await integration?.setup(
                    this,
                    this.messageHandler.ad?.iframe,
                    mergedConfig
                );

                this.#dispatchLifecycleEvent(
                    "advantage:format-start",
                    format,
                    this.messageHandler.ad?.iframe as HTMLElement
                );

                resolve();
            } catch (error) {
                this.reset();
                reject(error);
            }
        });
    };

    /**
     * Forces a specific ad format without waiting for a message from the iframe.
     * This allows publishers to directly control which format to display.
     *
     * @param format - The format to apply
     * @param iframe - The iframe element to use for the ad (optional)
     * @param options - Additional options to pass to the format's setup function
     * @returns A promise that resolves when the format has been applied
     */
    forceFormat = async (
        format: AdvantageFormatName | string,
        iframe?: HTMLIFrameElement,
        options?: any
    ) => {
        logger.debug("FORCE FORMAT", format);

        // If iframe is provided, create an AdvantageAd object
        if (iframe) {
            // Create a dummy MessageChannel for type compatibility
            const channel = new MessageChannel();

            this.messageHandler.ad = {
                iframe,
                eventSource: iframe.contentWindow!,
                port: channel.port1 // Using port1 from the MessageChannel instead of null
            };
        }

        // Create a session ID if needed for the format
        const sessionID = Math.random().toString(36).substring(2, 15);

        // Construct a message object with the format and session ID
        const message: AdvantageMessage = {
            type: ADVANTAGE,
            action: AdvantageMessageAction.REQUEST_FORMAT,
            format: format,
            sessionID: sessionID,
            ...options
        };

        // Call morphIntoFormat with the constructed message
        return this.morphIntoFormat(format, message);
    };

    /**
     * Changes the content of the wrapper.
     * @param content - The new content to be added to the wrapper.
     */
    changeContent(content: string | HTMLElement) {
        // Access the projected content in the light DOM
        const projectedContent = this.querySelector(
            '[slot="advantage-ad-slot"]'
        );
        projectedContent?.remove();
        // Check the type of the new content and add it accordingly
        if (typeof content === "string") {
            // If the content is a string, create a container for it
            const container = document.createElement("div");
            container.innerHTML = content;
            // Assign the slot attribute so it gets projected correctly
            container.setAttribute("slot", "advantage-ad-slot");
            this.appendChild(container); // Add to the light DOM of the custom element
        } else {
            // If the content is an HTMLElement, directly set the slot attribute and append
            content.setAttribute("slot", "advantage-ad-slot");
            this.appendChild(content); // Add to the light DOM of the custom element
        }
    }

    /**
     * Resets the current ad format.
     */
    async reset() {
        if (!this.currentFormat) {
            return;
        }

        logger.debug("Resetting wrapper. Current format:", this.currentFormat);

        // Merge Advantage config with High Impact JS config
        const mergedConfig = this.#activeLifecycle?.config ?? {
            ...Advantage.getInstance().config,
            ...getRegisteredCompatibilityConfig()
        };

        const formatConfig = this.#activeLifecycle?.format ??
            Advantage.getInstance().formats.get(this.currentFormat);
        if (formatConfig) {
            formatConfig.reset(this, this.messageHandler?.ad?.iframe);
        }
        const integration = this.#activeLifecycle
            ? this.#activeLifecycle.integration
            : Advantage.getInstance().formatIntegrations.get(this.currentFormat);
        if (integration) {
            if (typeof integration.reset === "function") {
                integration.reset(
                    this,
                    this.messageHandler?.ad?.iframe,
                    mergedConfig
                );
            } else if (typeof integration.onReset === "function") {
                integration.onReset(this, this.messageHandler?.ad?.iframe);
            }
        }
        this.uiLayer.changeContent("");

        const previousFormat = this.currentFormat;
        this.currentFormat = "";
        this.#activeLifecycle = undefined;
        this.#updateCurrentFormatAttribute();

        // Always clear injected styles, even if the format's reset forgot to
        this.resetCSS();

        this.#dispatchLifecycleEvent(
            "advantage:format-reset",
            previousFormat,
            this.messageHandler?.ad?.iframe as HTMLElement
        );

        // Clear the active format iframe reference
        this.#activeFormatIframe = null;
        logger.debug("Wrapper reset complete. Active iframe cleared.");
    }

    animateClose(callback?: () => void) {
        this.classList.add("animate");
        this.addEventListener(
            "transitionend",
            () => {
                // If a new format has started (currentFormat is set), abort cleanup
                if (this.currentFormat) {
                    return;
                }
                this.style.display = "none";
                if (callback) {
                    callback();
                }
            },
            { once: true }
        );
        this.style.height = "0px";
    }

    /**
     * Closes the current ad format.
     */
    async close() {
        if (!this.currentFormat) {
            logger.info("No format to close.");
            return;
        }

        // Merge Advantage config with High Impact JS config
        const mergedConfig = this.#activeLifecycle?.config ?? {
            ...Advantage.getInstance().config,
            ...getRegisteredCompatibilityConfig()
        };

        const formatConfig = this.#activeLifecycle?.format ??
            Advantage.getInstance().formats.get(this.currentFormat);
        logger.info(
            "Advantage.getInstance().formats",
            Advantage.getInstance().formats
        );
        logger.info("Advantage.getInstance().id", Advantage.id);
        logger.info("Closing the current format.", formatConfig);
        if (formatConfig) {
            logger.info("Closing the current format.", formatConfig);
            formatConfig.close
                ? formatConfig.close(this, this.messageHandler?.ad?.iframe)
                : undefined;
        }
        const integration = this.#activeLifecycle
            ? this.#activeLifecycle.integration
            : Advantage.getInstance().formatIntegrations.get(this.currentFormat);
        if (integration) {
            if (typeof integration.close === "function") {
                integration.close(
                    this,
                    this.messageHandler?.ad?.iframe,
                    mergedConfig
                );
            } else if (typeof integration.onClose === "function") {
                integration.onClose(this, this.messageHandler?.ad?.iframe);
            }
        }
        const previousFormat = this.currentFormat;
        this.currentFormat = "";
        this.#activeLifecycle = undefined;
        this.#updateCurrentFormatAttribute();

        this.#dispatchLifecycleEvent(
            "advantage:format-close",
            previousFormat,
            this.messageHandler?.ad?.iframe as HTMLElement
        );

        // Clear the active format iframe reference
        this.#activeFormatIframe = null;
        logger.debug("Format closed. Active iframe cleared.");
    }

    /**
     * Applies styles to all child elements of the wrapper.
     * @param styles - The CSS styles to apply.
     */
    applyStylesToAllChildElements(styles: string) {
        this.contentNodes.forEach((node) =>
            traverseNodes(node, (node) => {
                if (
                    node instanceof HTMLDivElement ||
                    node instanceof HTMLIFrameElement
                ) {
                    node.style.cssText = styles;
                }
            })
        );
    }

    /**
     * Inserts CSS into the shadow root of the wrapper.
     * @param CSS - The CSS to insert.
     */
    insertCSS(CSS: string) {
        try {
            if (supportsAdoptingStyleSheets) {
                (this.#styleSheet as CSSStyleSheet).replaceSync(CSS);
            } else {
                // In test environments (JSDOM), handle potential issues with large CSS strings
                const styleElement = this.#styleSheet as HTMLStyleElement;
                // Check for JSDOM specifically (more reliable than NODE_ENV check)
                const isJSDOM =
                    typeof window !== "undefined" &&
                    window.navigator &&
                    window.navigator.userAgent.includes("jsdom");
                const isTestEnvironment =
                    typeof process !== "undefined" &&
                    process.env?.NODE_ENV === "test";

                if (isTestEnvironment && isJSDOM) {
                    // In JSDOM test environment, replace problematic data URLs
                    const processedCSS = CSS.replace(
                        /url\("data:image\/[^"]+"\)/g,
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E\")"
                    );
                    styleElement.textContent = processedCSS;
                } else {
                    styleElement.textContent = CSS;
                }
            }
        } catch (error) {
            // If CSS insertion fails, log the error but don't break the format setup
            logger.debug("Failed to insert CSS:", error);
            // In test environments, this is often due to JSDOM limitations, so we can continue
            const isTestEnvironment =
                typeof process !== "undefined" &&
                process.env?.NODE_ENV === "test";
            if (!isTestEnvironment) {
                throw error;
            }
        }
    }

    /**
     * Resets the CSS in the shadow root of the wrapper.
     */
    resetCSS() {
        if (supportsAdoptingStyleSheets) {
            (this.#styleSheet as CSSStyleSheet).replaceSync("");
        } else {
            (this.#styleSheet as HTMLStyleElement).textContent = "";
        }
    }

    /**
     * Lifecycle method called when the element is disconnected from the DOM.
     * Uses a timeout to distinguish between temporary removal and actual cleanup.
     */
    disconnectedCallback() {
        logger.debug("AdvantageWrapper disconnected from DOM. Cleaning up.");

        // Disconnect the mutation observer
        this.#mutationObserver?.disconnect();

        // Remove event listener
        if (this.#slotChangeHandler) {
            this.#slotAdvantageContent.removeEventListener(
                "slotchange",
                this.#slotChangeHandler
            );
        }

        // Unregister from Advantage instance
        Advantage.getInstance().unregisterWrapper(this);

        // Use a timeout to distinguish between temporary removal and actual cleanup
        this.#disconnectTimeout = setTimeout(() => {
            logger.debug("AdvantageWrapper disconnected from DOM. Resetting.");
            this.reset();
            this.#disconnectTimeout = null;
        }, AdvantageWrapper.DISCONNECT_TIMEOUT_MS);
    }

    /**
     * Lifecycle method called when the element is connected to the DOM.
     * Clears the disconnect timeout if the element reconnects quickly.
     */
    connectedCallback() {
        // Clear the timeout if reconnected quickly (element was temporarily removed)
        if (this.#disconnectTimeout) {
            logger.debug(
                "AdvantageWrapper reconnected to DOM. Canceling reset."
            );
            clearTimeout(this.#disconnectTimeout);
            this.#disconnectTimeout = null;
        }
    }
}
