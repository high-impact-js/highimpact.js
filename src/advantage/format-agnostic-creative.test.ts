import { Advantage, AdvantageFormatName } from "./core";
import type { IAdvantageWrapper } from "../types";

const createWrappedSlot = (elementId: string) => {
    const wrapper = document.createElement(
        "advantage-wrapper"
    ) as IAdvantageWrapper;
    const slotContent = document.createElement("div");
    slotContent.setAttribute("slot", "advantage-ad-slot");
    const slotElement = document.createElement("div");
    slotElement.id = elementId;
    const iframe = document.createElement("iframe");
    slotElement.appendChild(iframe);
    slotContent.appendChild(slotElement);
    wrapper.appendChild(slotContent);
    document.body.appendChild(wrapper);
    return { wrapper, iframe };
};

const sendFormatAgnosticSignal = (iframe: HTMLIFrameElement) => {
    window.dispatchEvent(
        new MessageEvent("message", {
            data: JSON.stringify({
                sender: "high-impact-js",
                action: "AD_RENDERED"
            }),
            source: iframe.contentWindow
        })
    );
};

describe("format-agnostic creatives in Advantage core", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        Advantage.getInstance().configure({}, { merge: false });
        Advantage.getInstance().configure({
            formatAgnosticCreatives: {
                formatMappings: [
                    {
                        format: AdvantageFormatName.TopScroll,
                        sizes: [[1, 1]]
                    },
                    {
                        format: AdvantageFormatName.Midscroll,
                        sizes: [[1, 2]]
                    }
                ]
            }
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("still activates after an unrelated configuration update", () => {
        const { wrapper, iframe } = createWrappedSlot("incremental-slot");
        const force = jest.spyOn(wrapper, "forceFormat").mockResolvedValue(undefined);
        Advantage.getInstance().configure({ messageValidator: () => true });
        Advantage.getInstance().reportSlotRendered({
            elementId: "incremental-slot", size: [1, 1]
        });
        sendFormatAgnosticSignal(iframe);
        expect(force).toHaveBeenCalledWith(AdvantageFormatName.TopScroll, iframe);
    });

    it("maps the same creative signal to formats using reported sizes", async () => {
        const topscroll = createWrappedSlot("topscroll-slot");
        const midscroll = createWrappedSlot("midscroll-slot");
        const topscrollForce = jest
            .spyOn(topscroll.wrapper, "forceFormat")
            .mockResolvedValue(undefined);
        const midscrollForce = jest
            .spyOn(midscroll.wrapper, "forceFormat")
            .mockResolvedValue(undefined);

        Advantage.getInstance().reportSlotRendered({
            elementId: "topscroll-slot",
            size: [1, 1]
        });
        Advantage.getInstance().reportSlotRendered({
            elementId: "midscroll-slot",
            size: [1, 2]
        });
        sendFormatAgnosticSignal(topscroll.iframe);
        sendFormatAgnosticSignal(midscroll.iframe);

        await Promise.resolve();
        expect(topscrollForce).toHaveBeenCalledWith(
            AdvantageFormatName.TopScroll,
            topscroll.iframe
        );
        expect(midscrollForce).toHaveBeenCalledWith(
            AdvantageFormatName.Midscroll,
            midscroll.iframe
        );
    });

    it("waits for the ad-server report when AD_RENDERED arrives first", async () => {
        const { wrapper, iframe } = createWrappedSlot("late-report-slot");
        const forceFormat = jest
            .spyOn(wrapper, "forceFormat")
            .mockResolvedValue(undefined);

        sendFormatAgnosticSignal(iframe);
        expect(forceFormat).not.toHaveBeenCalled();

        Advantage.getInstance().reportSlotRendered({
            elementId: "late-report-slot",
            size: [1, 2]
        });
        await Promise.resolve();

        expect(forceFormat).toHaveBeenCalledWith(
            AdvantageFormatName.Midscroll,
            iframe
        );
    });

    it("does not associate a creative signal with another slot", async () => {
        const first = createWrappedSlot("first-slot");
        const second = createWrappedSlot("second-slot");
        const firstForce = jest
            .spyOn(first.wrapper, "forceFormat")
            .mockResolvedValue(undefined);
        const secondForce = jest
            .spyOn(second.wrapper, "forceFormat")
            .mockResolvedValue(undefined);

        Advantage.getInstance().reportSlotRendered({
            elementId: "first-slot",
            size: [1, 1]
        });
        sendFormatAgnosticSignal(second.iframe);
        await Promise.resolve();

        expect(firstForce).not.toHaveBeenCalled();
        expect(secondForce).not.toHaveBeenCalled();

        sendFormatAgnosticSignal(first.iframe);
        Advantage.getInstance().reportSlotRendered({
            elementId: "second-slot",
            size: [1, 2]
        });
        await Promise.resolve();

        expect(firstForce).toHaveBeenCalledWith(
            AdvantageFormatName.TopScroll,
            first.iframe
        );
        expect(secondForce).toHaveBeenCalledWith(
            AdvantageFormatName.Midscroll,
            second.iframe
        );
    });

    it("ignores AD_RENDERED from an iframe outside the wrapper", async () => {
        const { wrapper } = createWrappedSlot("known-slot");
        const forceFormat = jest
            .spyOn(wrapper, "forceFormat")
            .mockResolvedValue(undefined);
        const unrelatedIframe = document.createElement("iframe");
        document.body.appendChild(unrelatedIframe);

        Advantage.getInstance().reportSlotRendered({
            elementId: "known-slot",
            size: [1, 1]
        });
        sendFormatAgnosticSignal(unrelatedIframe);
        await Promise.resolve();

        expect(forceFormat).not.toHaveBeenCalled();
    });

    it("consumes an unmapped pair instead of reusing its signal", async () => {
        const { wrapper, iframe } = createWrappedSlot("unmapped-slot");
        const forceFormat = jest
            .spyOn(wrapper, "forceFormat")
            .mockResolvedValue(undefined);

        Advantage.getInstance().reportSlotRendered({
            elementId: "unmapped-slot",
            size: [9, 9]
        });
        sendFormatAgnosticSignal(iframe);
        Advantage.getInstance().reportSlotRendered({
            elementId: "unmapped-slot",
            size: [1, 1]
        });
        await Promise.resolve();

        expect(forceFormat).not.toHaveBeenCalled();

        sendFormatAgnosticSignal(iframe);
        await Promise.resolve();
        expect(forceFormat).toHaveBeenCalledWith(
            AdvantageFormatName.TopScroll,
            iframe
        );
    });

    it("does not pair events from refreshes that are too far apart", async () => {
        const now = jest.spyOn(Date, "now");
        now.mockReturnValueOnce(1_000);
        const { wrapper, iframe } = createWrappedSlot("stale-slot");
        const forceFormat = jest
            .spyOn(wrapper, "forceFormat")
            .mockResolvedValue(undefined);

        sendFormatAgnosticSignal(iframe);
        now.mockReturnValueOnce(12_000);
        Advantage.getInstance().reportSlotRendered({
            elementId: "stale-slot",
            size: [1, 1]
        });
        await Promise.resolve();

        expect(forceFormat).not.toHaveBeenCalled();

        now.mockReturnValueOnce(12_001);
        sendFormatAgnosticSignal(iframe);
        await Promise.resolve();
        expect(forceFormat).toHaveBeenCalledWith(
            AdvantageFormatName.TopScroll,
            iframe
        );
    });

    it("does not activate when a size maps to multiple formats", async () => {
        Advantage.getInstance().configure({
            formatAgnosticCreatives: {
                formatMappings: [
                    {
                        format: AdvantageFormatName.TopScroll,
                        sizes: [[1, 1]]
                    },
                    {
                        format: AdvantageFormatName.Midscroll,
                        sizes: [[1, 1]]
                    }
                ]
            }
        });
        const { wrapper, iframe } = createWrappedSlot("ambiguous-slot");
        const forceFormat = jest
            .spyOn(wrapper, "forceFormat")
            .mockResolvedValue(undefined);

        Advantage.getInstance().reportSlotRendered({
            elementId: "ambiguous-slot",
            size: [1, 1]
        });
        sendFormatAgnosticSignal(iframe);
        await Promise.resolve();

        expect(forceFormat).not.toHaveBeenCalled();
    });

    it("clears pending and active state for an empty render", async () => {
        const { wrapper, iframe } = createWrappedSlot("empty-slot");
        const forceFormat = jest
            .spyOn(wrapper, "forceFormat")
            .mockResolvedValue(undefined);
        const reset = jest.spyOn(wrapper, "reset");

        sendFormatAgnosticSignal(iframe);
        expect(
            Advantage.getInstance().reportSlotRendered({
                elementId: "empty-slot",
                isEmpty: true
            })
        ).toBe(true);
        Advantage.getInstance().reportSlotRendered({
            elementId: "empty-slot",
            size: [1, 1]
        });
        await Promise.resolve();
        expect(forceFormat).not.toHaveBeenCalled();

        wrapper.currentFormat = AdvantageFormatName.TopScroll;
        Advantage.getInstance().reportSlotRendered({
            elementId: "empty-slot",
            isEmpty: true
        });
        expect(reset).toHaveBeenCalledTimes(1);
    });
});
