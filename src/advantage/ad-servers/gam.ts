import type {
    AdvantageAdSize,
    AdvantageSlotRenderReport
} from "../../types";

export interface AdvantageSlotRenderReporter {
    reportSlotRendered(report: AdvantageSlotRenderReport): boolean;
}

export interface AdvantageAdServerConnection {
    disconnect(): void;
}

const toAdSize = (size: unknown): AdvantageAdSize | undefined => {
    if (
        !Array.isArray(size) ||
        size.length !== 2 ||
        !size.every(
            (value) =>
                typeof value === "number" &&
                Number.isFinite(value) &&
                value > 0
        )
    ) {
        return undefined;
    }
    return [size[0], size[1]];
};

/**
 * Forwards GAM's selected creative size to Advantage core. This intentionally
 * contains no slot discovery, wrapping, or High Impact JS API compatibility.
 *
 * @experimental The format-agnostic creative API may change before release.
 */
export const connectGoogleAdManager = (
    advantage: AdvantageSlotRenderReporter
): AdvantageAdServerConnection => {
    const googletag = ((window as any).googletag = (window as any).googletag || {
        cmd: []
    });

    const onSlotRenderEnded = (event: any) => {
        const elementId = event.slot?.getSlotElementId?.();
        if (!elementId) {
            return;
        }
        advantage.reportSlotRendered({
            elementId,
            size: toAdSize(event.size),
            isEmpty: event.isEmpty
        });
    };

    googletag.cmd.push(() => {
        googletag.pubads().addEventListener(
            "slotRenderEnded",
            onSlotRenderEnded
        );
    });

    return {
        disconnect: () => {
            googletag.cmd.push(() => {
                googletag
                    .pubads()
                    .removeEventListener?.(
                        "slotRenderEnded",
                        onSlotRenderEnded
                    );
            });
        }
    };
};
