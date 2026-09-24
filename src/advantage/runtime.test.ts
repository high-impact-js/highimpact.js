import type { IAdvantageWrapper } from "../types";

// Separate module registries model independently evaluated dependency graphs.
const copy = () => {
    let api!: typeof import("./format-agnostic-creative");
    jest.isolateModules(() => {
        api = require("./format-agnostic-creative");
    });
    return api;
};

describe("shared creative rendezvous", () => {
    it.each([false, true])(
        "pairs across module copies (signal first: %s)",
        (signalFirst) => {
            const first = copy();
            const second = copy();
            const context = {
                config: {
                    formatAgnosticCreatives: {
                        formatMappings: [{
                            format: "CUSTOM",
                            sizes: [[970, 250] as [number, number]]
                        }]
                    }
                }
            };
            const wrapper = document.createElement(
                "advantage-wrapper"
            ) as IAdvantageWrapper;
            wrapper.innerHTML = '<div id="shared-slot"><iframe></iframe></div>';
            wrapper.forceFormat = jest.fn().mockResolvedValue(undefined);
            document.body.append(wrapper);
            const iframe = wrapper.querySelector("iframe")!;
            const signal = () => first.reportFormatAgnosticCreativeSignal(
                context, wrapper, iframe
            );
            const report = () => second.reportSlotRendered(context, {
                elementId: "shared-slot", size: [970, 250]
            });
            try {
                if (signalFirst) {
                    signal();
                    report();
                } else {
                    report();
                    signal();
                }
                expect(wrapper.forceFormat).toHaveBeenCalledTimes(1);
                expect(wrapper.forceFormat).toHaveBeenCalledWith("CUSTOM", iframe);
            } finally {
                wrapper.remove();
            }
        }
    );
});
