export { Advantage } from "./advantage";
import { AdvantageWrapper } from "./wrapper";
import { AdvantageUILayer } from "./ui-layer";
import logger from "../utils/logging";
import { advantageWrapAdSlotElement as actualAdvantageWrapAdSlotElement } from "../utils/wrapping-helper";
export { actualAdvantageWrapAdSlotElement as advantageWrapAdSlotElement };
export * from "./messaging";
export * from "../types";

import { getSharedState } from "./runtime";

const installation = getSharedState("core-installation", () => ({
    installed: false
}));

const executeQueuedCallback = (callback: any) => {
    try {
        callback(actualAdvantageWrapAdSlotElement);
    } catch (error) {
        logger.error("Error executing callback:", error);
    }
};

const processQueue = () => {
    const queue = ((window as any).advantageCmdQueue ??= []);
    const pending = queue.splice(0);
    queue.push = function (callback: any) {
        Array.prototype.push.call(this, callback);
        executeQueuedCallback(callback);
    };
    for (const callback of pending) {
        executeQueuedCallback(callback);
    }
};

if (!installation.installed) {
    // Set the guard before callbacks run: they may evaluate another bundle.
    installation.installed = true;
    if (!customElements.get("advantage-wrapper")) {
        customElements.define("advantage-wrapper", AdvantageWrapper);
    }
    if (!customElements.get("advantage-ui-layer")) {
        customElements.define("advantage-ui-layer", AdvantageUILayer);
    }
    (window as any).advantageWrapAdSlotElement = actualAdvantageWrapAdSlotElement;
    (window as any).advantageCmd = executeQueuedCallback;

    const wrapQueue = (window as any).advantageWrapQueue;
    if (wrapQueue) {
        for (const [target, excludedFormats] of wrapQueue.splice(0)) {
            actualAdvantageWrapAdSlotElement(target, excludedFormats);
        }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", processQueue, { once: true });
    } else {
        processQueue();
    }
}
