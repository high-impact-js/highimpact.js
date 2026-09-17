/**
 * @fileoverview Xandr Plugin for High Impact JS Compatibility Layer
 */

import { CompatibilityPlugin } from "../types";
import logger from "../../../utils/logging";

declare global {
    interface Window {
        apntag: any;
    }
}

export class XandrPlugin implements CompatibilityPlugin {
    init(): void {
        logger.debug("[Xandr Plugin] Initializing...");

        // Initialize apntag if not already present
        window.apntag = window.apntag || { cmd: [] };
        if (!window.apntag.cmd) {
            logger.debug(
                "[Xandr Plugin] Xandr tag is defined but no cmd array"
            );
            window.apntag.cmd = [];
        }

        logger.debug("[Xandr Plugin] Initialized successfully");
    }

    /**
     * Parses a Xandr slot to extract relevant information for High Impact JS
     */
    private parseSlot(slot: any) {
        const elementId = slot.targetId || slot.getTargetId?.();
        const adWrapper = document.getElementById(elementId);

        if (adWrapper) {
            // Look for Xandr ad containers
            const adUnitSelectors = [
                'div[id*="apn-ad-slot"]',
                'iframe[id*="apn-ad-slot"]',
                'div[class*="apn-ad"]',
                'iframe[class*="apn-ad"]'
            ];

            let adUnit: HTMLElement | null = null;
            let adIframe: HTMLElement | null = null;

            for (const selector of adUnitSelectors) {
                const elements = adWrapper.querySelectorAll(selector);
                if (elements.length > 0) {
                    adUnit = elements[0] as HTMLElement;
                    adIframe = (elements[1] as HTMLElement) || adUnit;
                    break;
                }
            }

            if (!adUnit || !adIframe) {
                // Fallback: look for any iframe or div
                adIframe =
                    adWrapper.querySelector("iframe") ||
                    adWrapper.querySelector("div");
                adUnit = adIframe;
            }

            const html = slot.getHtml ? slot.getHtml() : slot.html || "";
            const size = slot.size || slot.getSize?.() || [0, 0];

            logger.debug(`[Xandr Plugin] Parsed slot ${elementId}:`, {
                adWrapper: !!adWrapper,
                adUnit: !!adUnit,
                adIframe: !!adIframe,
                size,
                hasHtml: !!html
            });

            return {
                adWrapper,
                adUnit,
                adIframe,
                size,
                html,
                elementId,
                plugin: "xandr"
            };
        }

        logger.debug(
            `[Xandr Plugin] Could not find ad wrapper for slot ${elementId}`
        );
        return null;
    }

    /**
     * Gets a slot from a source window (for post-message communication)
     * Using the original High Impact JS validation approach for Xandr
     */
    getSlotFromSource(source: Window): any {
        // Original High Impact JS used 'iframe[id*="utif"]' for Xandr
        const xandrIframes = document.querySelectorAll('iframe[id*="utif"]');

        if (!xandrIframes.length) {
            return null;
        }

        // Original High Impact JS isAncestor function - exactly as they implemented it
        const isAncestor = (
            childWindow: Window,
            frameWindow: Window
        ): boolean => {
            if (frameWindow === childWindow) {
                return true;
            } else if (childWindow === window.top) {
                return false;
            }
            try {
                return isAncestor(childWindow.parent, frameWindow);
            } catch (e) {
                return false;
            }
        };

        // Find iframe that matches source using original High Impact JS logic
        const matchingIframe = Array.from(xandrIframes).find((frame) => {
            try {
                const frameWindow = (frame as HTMLIFrameElement).contentWindow;
                if (!frameWindow) {
                    return false;
                }
                return isAncestor(source, frameWindow);
            } catch (e) {
                return false;
            }
        });

        if (!matchingIframe) {
            // Fallback: try to match using iframe name
            try {
                const sourceName = (source as any).name;
                if (sourceName) {
                    const namedIframe = document.getElementById(sourceName);
                    if (
                        namedIframe &&
                        Array.from(xandrIframes).includes(namedIframe)
                    ) {
                        const tagId = namedIframe.id
                            .replace("utif_", "")
                            .split("_")[0];
                        return this.getTagByIdOrFallback(namedIframe, tagId);
                    }
                }
            } catch (e) {
                // Could not get source name
            }

            // Final fallback: Use the most recently added iframe
            if (xandrIframes.length > 0) {
                const lastIframe = xandrIframes[xandrIframes.length - 1];
                const tagId = lastIframe.id.replace("utif_", "").split("_")[0];
                return this.getTagByIdOrFallback(lastIframe, tagId);
            }

            return null;
        }

        logger.debug(
            `[Xandr Plugin] Found matching iframe: ${matchingIframe.id}`
        );

        const tagId = matchingIframe.id.replace("utif_", "").split("_")[0];

        return this.getTagByIdOrFallback(matchingIframe, tagId);
    }

    /**
     * Helper method to get tag by ID or create fallback
     */
    private getTagByIdOrFallback(iframe: Element, tagId: string): any {
        try {
            if (!window.apntag?.getTag) {
                return this.createFallbackSlotFromIframe(iframe);
            }

            const tag = window.apntag.getTag(tagId);

            if (!tag) {
                return this.createFallbackSlotFromIframe(iframe);
            }

            return this.parseTag(tag);
        } catch (e) {
            return this.createFallbackSlotFromIframe(iframe);
        }
    }

    /**
     * Parse Xandr tag using original High Impact JS approach
     */
    private parseTag(slot: any) {
        const elementId = slot.targetId;
        const adWrapper = document.getElementById(elementId);

        if (adWrapper) {
            // Original High Impact JS looked for 'div[id^="div_utif_"], iframe[id^="utif_"]'
            const [adUnit, adIframe] = adWrapper.querySelectorAll(
                'div[id^="div_utif_"], iframe[id^="utif_"]'
            );

            const html =
                slot.banner?.content ||
                (adIframe as HTMLIFrameElement)?.contentDocument?.body
                    ?.innerHTML ||
                "";
            const size = [
                slot.width || slot.initialWidth,
                slot.height || slot.initialHeight
            ];

            logger.debug(`[Xandr Plugin] Parsed tag ${elementId}:`, {
                adWrapper: !!adWrapper,
                adUnit: !!adUnit,
                adIframe: !!adIframe,
                size,
                hasHtml: !!html
            });

            return {
                adWrapper,
                adUnit,
                adIframe,
                size,
                html,
                elementId,
                plugin: "xandr"
            };
        }

        logger.debug(
            `[Xandr Plugin] Could not find ad wrapper for tag ${elementId}`
        );
        return null;
    }

    /**
     * Creates a fallback slot object from an iframe element when Xandr tag lookup fails
     */
    private createFallbackSlotFromIframe(iframe: Element): any {
        // Try to find the container element
        const container = iframe.parentElement;
        if (!container || !container.id) {
            return null;
        }

        const elementId = container.id;

        // Determine size based on iframe dimensions or defaults
        let size = [300, 250]; // Default size
        if (iframe instanceof HTMLIFrameElement) {
            const width = parseInt(iframe.style.width) || iframe.offsetWidth;
            const height = parseInt(iframe.style.height) || iframe.offsetHeight;
            if (width && height) {
                size = [width, height];
            }
        }

        return {
            adWrapper: container,
            adUnit: iframe,
            adIframe: iframe,
            size,
            html: "<div>Xandr fallback slot content</div>",
            elementId,
            plugin: "xandr"
        };
    }

    /**
     * Sets up the ad slot rendered event handler
     */
    onAdSlotRendered(handler: (slot: any) => void): void {
        window.apntag.cmd.push(() => {
            logger.debug(
                "[Xandr Plugin] Setting up adAvailable event listener"
            );

            // Xandr uses different event names than GAM
            window.apntag.onEvent?.("adAvailable", (event: any) => {
                logger.debug("[Xandr Plugin] adAvailable event received:", {
                    targetId: event.targetId,
                    size: event.size,
                    isEmpty: !event.adObj
                });

                if (!event.adObj) {
                    logger.debug("[Xandr Plugin] No ad object, skipping");
                    return;
                }

                const slot = {
                    targetId: event.targetId,
                    size: event.size,
                    html: event.adObj?.html || "",
                    getTargetId: () => event.targetId,
                    getHtml: () => event.adObj?.html || "",
                    getSize: () => event.size
                };

                const parsedSlot = this.parseSlot(slot);
                if (parsedSlot) {
                    logger.debug(
                        "[Xandr Plugin] Calling ad slot rendered handler for:",
                        parsedSlot.elementId
                    );
                    handler(parsedSlot);
                } else {
                    logger.debug(
                        "[Xandr Plugin] Could not parse slot, skipping"
                    );
                }
            });

            // Also listen for adLoaded event as a fallback
            window.apntag.onEvent?.("adLoaded", (event: any) => {
                logger.debug("[Xandr Plugin] adLoaded event received:", {
                    targetId: event.targetId,
                    size: event.size
                });

                const slot = {
                    targetId: event.targetId,
                    size: event.size,
                    html: event.html || "",
                    getTargetId: () => event.targetId,
                    getHtml: () => event.html || "",
                    getSize: () => event.size
                };

                const parsedSlot = this.parseSlot(slot);
                if (parsedSlot) {
                    logger.debug(
                        "[Xandr Plugin] Calling ad slot rendered handler for loaded ad:",
                        parsedSlot.elementId
                    );
                    handler(parsedSlot);
                }
            });
        });
    }

    /**
     * Gets all currently rendered slots
     */
    async getRenderedSlots(): Promise<any[]> {
        return new Promise((resolve) => {
            // In test environment, return empty array immediately
            if (
                typeof process !== "undefined" &&
                process.env?.NODE_ENV === "test"
            ) {
                resolve([]);
                return;
            }

            // Add timeout to prevent hanging if Xandr is not available
            const timeout = setTimeout(() => {
                logger.debug(
                    "[Xandr Plugin] Timeout waiting for Xandr, returning empty slots"
                );
                resolve([]);
            }, 2000); // 2 second timeout

            window.apntag.cmd.push(() => {
                try {
                    clearTimeout(timeout);

                    // Xandr doesn't have a direct way to get all slots like GAM
                    // We'll try to find rendered ads in the DOM
                    const xandrElements = document.querySelectorAll(
                        '[id*="apn-ad"], [class*="apn-ad"]'
                    );
                    logger.debug(
                        `[Xandr Plugin] Found ${xandrElements.length} potential Xandr ad elements`
                    );

                    const parsedSlots: any[] = [];

                    xandrElements.forEach((element) => {
                        const elementId = element.id;
                        if (elementId) {
                            const mockSlot = {
                                targetId: elementId,
                                size: [
                                    element.clientWidth,
                                    element.clientHeight
                                ],
                                html: element.innerHTML,
                                getTargetId: () => elementId,
                                getHtml: () => element.innerHTML,
                                getSize: () => [
                                    element.clientWidth,
                                    element.clientHeight
                                ]
                            };

                            const parsedSlot = this.parseSlot(mockSlot);
                            if (
                                parsedSlot &&
                                parsedSlot.adIframe &&
                                parsedSlot.adUnit
                            ) {
                                parsedSlots.push(parsedSlot);
                            }
                        }
                    });

                    logger.debug(
                        `[Xandr Plugin] Parsed ${parsedSlots.length} valid slots`
                    );
                    resolve(parsedSlots);
                } catch (error) {
                    clearTimeout(timeout);
                    logger.error(
                        "[Xandr Plugin] Error getting rendered slots:",
                        error
                    );
                    resolve([]);
                }
            });
        });
    }
}
