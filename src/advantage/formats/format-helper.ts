import type { AdvantageFormatOptions } from "../../types";

export function setDimensionsUntilAdvantageAdSlot(
    ad?: HTMLElement,
    inclusive: boolean = true
) {
    function setDimensionsTo100Percent(element: HTMLElement | null) {
        if (element) {
            element.style.setProperty("height", "100%", "important");
            element.style.setProperty("width", "100%", "important");
            // Remove HTML width/height attributes (e.g. from GAM iframes)
            // so they don't override CSS dimensions
            if (element.hasAttribute("width")) {
                element.removeAttribute("width");
            }
            if (element.hasAttribute("height")) {
                element.removeAttribute("height");
            }
        }
    }

    if (ad) {
        let parent = ad.parentElement;
        setDimensionsTo100Percent(ad);
        while (parent) {
            if (parent.slot === "advantage-ad-slot") {
                if (inclusive) {
                    setDimensionsTo100Percent(parent);
                }
                break;
            }
            setDimensionsTo100Percent(parent);
            parent = parent.parentElement;
        }
    }
}

export function resetDimensionsUntilAdvantageAdSlot(
    ad?: HTMLElement,
    inclusive: boolean = true
) {
    function resetDimensions(element: HTMLElement | null) {
        if (element) {
            element.style.removeProperty("height");
            element.style.removeProperty("width");
        }
    }

    if (ad) {
        // loop through the parent elements of the ad to find advantage-ad-slot
        let parent = ad.parentElement;
        resetDimensions(ad);
        while (parent) {
            if (parent.slot === "advantage-ad-slot") {
                if (inclusive) {
                    resetDimensions(parent);
                }
                break;
            }
            resetDimensions(parent);
            parent = parent.parentElement;
        }
    }
}

export function createIframe(
    src: string,
    id: string,
    className?: string,
    styles?: string
): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.id = id;
    if (className) {
        iframe.className = className;
    }
    if (styles) {
        iframe.style.cssText = styles;
    }
    iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-popups"
    );
    iframe.setAttribute("scrolling", "no");
    return iframe;
}

export const getTopBarHeight = (options?: AdvantageFormatOptions) =>
    Math.max(0, parseFloat(String(options?.topBarHeight)) || 0);
