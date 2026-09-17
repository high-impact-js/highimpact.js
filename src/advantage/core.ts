export { Advantage } from "./advantage";
import { AdvantageWrapper } from "./wrapper";
import { AdvantageUILayer } from "./ui-layer";
import logger from "../utils/logging";
import { advantageWrapAdSlotElement as actualAdvantageWrapAdSlotElement } from "../utils/wrapping-helper";
export { actualAdvantageWrapAdSlotElement as advantageWrapAdSlotElement };
export * from "./messaging";
export * from "../types";

if (typeof window !== "undefined") {
    // Process any wrapping requests queued before Advantage core loaded.
    if ((window as any).advantageWrapQueue) {
        for (const item of (window as any).advantageWrapQueue) {
            const [target, excludedFormats] = item;
            actualAdvantageWrapAdSlotElement(target, excludedFormats);
        }
    }

    (window as any).advantageWrapAdSlotElement =
        actualAdvantageWrapAdSlotElement;
}

const executeQueuedCallback = (callback: any) => {
    try {
        callback(actualAdvantageWrapAdSlotElement);
    } catch (error) {
        logger.error("Error executing callback:", error);
    }
};

const processQueue = () => {
    if ((window as any).advantageCmdQueue) {
        for (const callback of (window as any).advantageCmdQueue) {
            executeQueuedCallback(callback);
        }
    } else {
        (window as any).advantageCmdQueue = [];
    }

    (window as any).advantageCmdQueue.push = function (callback: any) {
        Array.prototype.push.call(this, callback);
        executeQueuedCallback(callback);
    };
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processQueue, { once: true });
} else {
    processQueue();
}

(window as any).advantageCmd = function (callback: any) {
    executeQueuedCallback(callback);
};

if (!customElements.get("advantage-wrapper")) {
    customElements.define("advantage-wrapper", AdvantageWrapper);
}
if (!customElements.get("advantage-ui-layer")) {
    customElements.define("advantage-ui-layer", AdvantageUILayer);
}
