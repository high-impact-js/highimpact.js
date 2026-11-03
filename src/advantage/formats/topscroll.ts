import {
    AdvantageFormat,
    AdvantageFormatName,
    AdvantageFormatOptions
} from "../../types";
import topscrollCSS from "./topscroll.css?inline";
import topscrollUICSS from "./topscroll-ui.css?inline";
import {
    setDimensionsUntilAdvantageAdSlot,
    resetDimensionsUntilAdvantageAdSlot,
    getTopBarHeight
} from "./format-helper";
import logger from "../../utils/logging";

const DEFAULT_HEIGHT = 80;

/**
 * Handles the scroll behavior when the down arrow is clicked
 * @param height - The configured height of the ad (in vh percentage)
 */
const handleDownArrowClick = (height?: number, topBarHeight = 0) => {
    logger.debug("Down arrow clicked");
    const scrollHeight =
        height && height <= 100
            ? window.innerHeight * (height / 100)
            : window.innerHeight * (DEFAULT_HEIGHT / 100);
    window.scrollBy({
        top: scrollHeight - topBarHeight,
        behavior: "smooth"
    });
};

export const topscroll: AdvantageFormat = {
    name: AdvantageFormatName.TopScroll,
    description:
        "A format that sticks the ad to the top of the page as the user scrolls down.",
    setup: (wrapper, ad, options) => {
        const defaults: AdvantageFormatOptions = {
            closeButton: true,
            closeButtonText: "Close ad",
            downArrow: true,
            height: DEFAULT_HEIGHT,
            closeButtonAnimationDuration: 0.5
        };
        const config = { ...defaults, ...(options || {}) };

        return new Promise((resolve) => {
            // Inser the CSS for the top scroll format
            wrapper.insertCSS(topscrollCSS);
            // Set the styles for the ad iframe
            if (ad) {
                setDimensionsUntilAdvantageAdSlot(ad);
            }

            // Change the content of the UI layer
            const uiContainer = document.createElement("div");
            uiContainer.id = "ui-container";

            const height =
                config.height && config.height <= 100
                    ? config.height
                    : DEFAULT_HEIGHT;
            const topBarHeight = getTopBarHeight(config);
            wrapper.style.setProperty(
                "--adv-topscroll-height",
                `calc(${height}svh - ${topBarHeight}px)`
            );

            if (config?.closeButton) {
                const closeBtn = document.createElement("div");
                closeBtn.id = "close";
                closeBtn.addEventListener("click", () => {
                    logger.debug("Close button clicked");
                    wrapper.close();
                });
                uiContainer.appendChild(closeBtn);
                wrapper.uiLayer.style.setProperty(
                    "--before-content",
                    `'${config.closeButtonText}'`
                );
                wrapper.style.setProperty(
                    "--adv-close-button-animation-duration",
                    `${config.closeButtonAnimationDuration}s`
                );
            }

            if (config?.downArrow) {
                const downArrow = document.createElement("div");
                downArrow.id = "down-arrow";
                downArrow.addEventListener("click", () =>
                    handleDownArrowClick(height, topBarHeight)
                );
                uiContainer.appendChild(downArrow);
            }

            wrapper.uiLayer.insertCSS(topscrollUICSS);
            wrapper.uiLayer.changeContent(uiContainer);

            resolve();
        });
    },
    simulate: (wrapper) => {
        wrapper.resetCSS();
        wrapper.insertCSS(topscrollCSS);
        const ad = document.createElement("div");
        ad.id = "simulated-ad";
        wrapper.changeContent(ad);

        // Change the content of the UI layer
        const uiContainer = document.createElement("div");
        uiContainer.id = "ui-container";
        const closeBtn = document.createElement("div");
        closeBtn.id = "close";
        const downArrow = document.createElement("div");
        downArrow.id = "down-arrow";
        uiContainer.appendChild(closeBtn);
        uiContainer.appendChild(downArrow);
        wrapper.uiLayer.insertCSS(topscrollUICSS);
        wrapper.uiLayer.changeContent(uiContainer);

        closeBtn.addEventListener("click", () => {
            logger.debug("Close button clicked");
            wrapper.close();
        });

        downArrow.addEventListener("click", () =>
            handleDownArrowClick(DEFAULT_HEIGHT)
        );
    },
    reset: (wrapper, ad?) => {
        if (ad) {
            resetDimensionsUntilAdvantageAdSlot(ad);
        }
        wrapper.resetCSS();
        wrapper.style.removeProperty("--adv-topscroll-height");
        wrapper.style.removeProperty("--adv-close-button-animation-duration");
        wrapper.uiLayer.style.removeProperty("--before-content");
    },
    close: (wrapper) => {
        wrapper.animateClose(() => {
            wrapper.resetCSS();
            wrapper.style.removeProperty("--adv-topscroll-height");
            wrapper.style.removeProperty(
                "--adv-close-button-animation-duration"
            );
            wrapper.uiLayer.style.removeProperty("--before-content");
        });
    }
};
