import { connectGoogleAdManager } from "./gam";

describe("Advantage GAM bridge", () => {
    it("forwards slotRenderEnded without installing the High Impact JS API", () => {
        let slotRenderEnded: ((event: any) => void) | undefined;
        const removeEventListener = jest.fn();
        (window as any).googletag = {
            cmd: { push: (callback: () => void) => callback() },
            pubads: () => ({
                addEventListener: (_name: string, callback: (event: any) => void) => {
                    slotRenderEnded = callback;
                },
                removeEventListener
            })
        };
        const advantage = { reportSlotRendered: jest.fn(() => true) };

        const connection = connectGoogleAdManager(advantage);
        slotRenderEnded?.({
            slot: { getSlotElementId: () => "tv2-slot" },
            size: [1, 2],
            isEmpty: false
        });

        expect(advantage.reportSlotRendered).toHaveBeenCalledWith({
            elementId: "tv2-slot",
            size: [1, 2],
            isEmpty: false
        });
        expect((window as any).highImpactJs).toBeUndefined();

        connection.disconnect();
        expect(removeEventListener).toHaveBeenCalledWith(
            "slotRenderEnded",
            expect.any(Function)
        );
    });

    it("ignores events without a slot id and normalizes unsupported sizes", () => {
        let slotRenderEnded: ((event: any) => void) | undefined;
        (window as any).googletag = {
            cmd: { push: (callback: () => void) => callback() },
            pubads: () => ({
                addEventListener: (
                    _name: string,
                    callback: (event: any) => void
                ) => {
                    slotRenderEnded = callback;
                }
            })
        };
        const advantage = { reportSlotRendered: jest.fn(() => true) };
        connectGoogleAdManager(advantage);

        slotRenderEnded?.({ slot: {}, size: [1, 1], isEmpty: false });
        expect(advantage.reportSlotRendered).not.toHaveBeenCalled();

        slotRenderEnded?.({
            slot: { getSlotElementId: () => "fluid-slot" },
            size: "fluid",
            isEmpty: false
        });
        expect(advantage.reportSlotRendered).toHaveBeenCalledWith({
            elementId: "fluid-slot",
            size: undefined,
            isEmpty: false
        });
    });
});
