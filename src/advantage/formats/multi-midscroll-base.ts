import {
    AdvantageFormat,
    AdvantageFormatName,
    AdvantageFormatOptions
} from "../../types";
import styles from "./multi-midscroll-base.css?inline";
import {
    setDimensionsUntilAdvantageAdSlot,
    resetDimensionsUntilAdvantageAdSlot,
    createIframe
} from "./format-helper";
import logger from "../../utils/logging";

export function createMultiMidscroll(
    name: AdvantageFormatName,
    description: string,
    multiplier: number
): AdvantageFormat {
    return {
        name,
        description,
        setup: (wrapper, ad, options) => {
            const defaults: AdvantageFormatOptions = {
                allowedOrigins: [],
                dangerouslyAllowAllOrigins: false
            };
            const config = { ...defaults, ...(options || {}) };

            function validateBackgroundAdURL(
                backgroundAdURL: string,
                allowedOrigins: string[]
            ): boolean {
                try {
                    const urlOrigin = new URL(backgroundAdURL).origin;

                    // Check if the origin is in the allowedOrigins list
                    return (
                        urlOrigin.startsWith("http") &&
                        allowedOrigins.includes(urlOrigin)
                    );
                } catch (error) {
                    logger.error(
                        "Invalid backgroundAdURL:",
                        backgroundAdURL,
                        error
                    );
                    return false; // Return false if the URL is invalid
                }
            }

            return new Promise((resolve, reject) => {
                if (!config.backgroundAdURL || !config.sessionID) {
                    reject(new Error("backgroundAdURL or sessionID is required"));
                    return;
                }
                if (
                    !validateBackgroundAdURL(
                        config.backgroundAdURL,
                        config.allowedOrigins ?? []
                    ) &&
                    !config.dangerouslyAllowAllOrigins
                ) {
                    reject(new Error("backgroundAdURL is not allowed"));
                    return;
                }

                // Set the CSS custom property for the multiplier and insert CSS
                wrapper.insertCSS(`:host { --adv-midscroll-multiplier: ${multiplier}; } ${styles}`);
                setDimensionsUntilAdvantageAdSlot(ad, false);

                const backgroundURL = new URL(config.backgroundAdURL);
                backgroundURL.searchParams.set("sessionId", config.sessionID);
                const background = document.createElement("div");
                background.id = "advantage-ad-background";
                const backgroundIframe = createIframe(
                    backgroundURL.toString(),
                    "background",
                    "advantage-background-iframe"
                );
                background.appendChild(backgroundIframe);
                // maybe wait for load?
                wrapper.shadowRoot
                    ?.getElementById("ad-slot")
                    ?.insertAdjacentElement("afterbegin", background);

                logger.debug("GOT BACKGROUND_AD_URL", config.backgroundAdURL);
                resolve();
            });
        },
        reset: (wrapper, ad?) => {
            resetDimensionsUntilAdvantageAdSlot(ad, false);
            wrapper.resetCSS();
            wrapper.shadowRoot
                ?.getElementById("ad-slot")
                ?.querySelector("#advantage-ad-background")
                ?.remove();
        },
        close: () => {}
    };
}