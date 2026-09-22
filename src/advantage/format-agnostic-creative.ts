import type {
    AdvantageConfig,
    AdvantageSlotRenderReport,
    IAdvantageWrapper
} from "../types";
import { logger } from "../utils";

interface FormatAgnosticCreativeContext {
    config: AdvantageConfig | null;
}

interface FormatAgnosticCreativeState {
    report?: AdvantageSlotRenderReport;
    reportedAt?: number;
    iframe?: HTMLIFrameElement;
    signaledAt?: number;
}

// The GAM render event and the creative message normally arrive together. A
// bounded window prevents an incomplete event from one ad from being paired
// with a later refresh while still allowing either event to arrive first.
const MAX_RENDEZVOUS_DELAY_MS = 10_000;

const statesByContext = new WeakMap<
    FormatAgnosticCreativeContext,
    WeakMap<IAdvantageWrapper, FormatAgnosticCreativeState>
>();

const getStates = (context: FormatAgnosticCreativeContext) => {
    let states = statesByContext.get(context);
    if (!states) {
        states = new WeakMap();
        statesByContext.set(context, states);
    }
    return states;
};

const activateIfReady = (
    context: FormatAgnosticCreativeContext,
    wrapper: IAdvantageWrapper
): void => {
    const states = getStates(context);
    const state = states.get(wrapper);
    if (
        !state?.report ||
        state.reportedAt === undefined ||
        !state.iframe ||
        state.signaledAt === undefined
    ) {
        return;
    }

    if (
        Math.abs(state.reportedAt - state.signaledAt) >
        MAX_RENDEZVOUS_DELAY_MS
    ) {
        // Retain only the newer half so it can rendezvous with the next event.
        states.set(
            wrapper,
            state.reportedAt > state.signaledAt
                ? { report: state.report, reportedAt: state.reportedAt }
                : { iframe: state.iframe, signaledAt: state.signaledAt }
        );
        return;
    }

    // A completed pair is single-use even when its size is unknown, ambiguous,
    // or disallowed. It must never leak into a later ad refresh.
    states.delete(wrapper);

    if (!wrapper.contains(state.iframe)) {
        logger.debug(
            "Format-agnostic creative iframe is no longer in its wrapper"
        );
        return;
    }

    const mappings = context.config?.formatAgnosticCreatives?.formatMappings;
    const size = state.report.size;
    if (!size || !mappings) {
        return;
    }

    const allowedFormats =
        wrapper.allowedFormats ??
        wrapper
            .getAttribute("allowed-formats")
            ?.split(",")
            .map((format) => format.trim().toUpperCase())
            .filter(Boolean);
    const matchingFormats = Array.from(
        new Set(
            mappings
                .filter((mapping) =>
                    mapping.sizes.some(
                        ([width, height]) =>
                            width === size[0] && height === size[1]
                    )
                )
                .map((mapping) => mapping.format.toUpperCase())
                .filter(
                    (format) =>
                        !allowedFormats || allowedFormats.includes(format)
                )
        )
    );

    if (matchingFormats.length !== 1) {
        logger.debug(
            `Format-agnostic creative size ${size.join("x")} resolved to ${matchingFormats.length} formats`
        );
        return;
    }

    wrapper.forceFormat(matchingFormats[0], state.iframe).catch((error) =>
        logger.error(
            `Failed to apply format-agnostic creative format ${matchingFormats[0]}`,
            error
        )
    );
};

export const reportSlotRendered = (
    context: FormatAgnosticCreativeContext,
    report: AdvantageSlotRenderReport
): boolean => {
    if (!context.config?.formatAgnosticCreatives) {
        return false;
    }

    const slotElement = document.getElementById(report.elementId);
    const wrapper = slotElement?.closest("advantage-wrapper") as
        | IAdvantageWrapper
        | undefined;
    if (!wrapper) {
        logger.debug(
            `No Advantage wrapper found for rendered slot ${report.elementId}`
        );
        return false;
    }

    const states = getStates(context);
    if (report.isEmpty) {
        states.delete(wrapper);
        if (wrapper.currentFormat) {
            wrapper.reset();
        }
        return true;
    }

    const state = states.get(wrapper) ?? {};
    state.report = report;
    state.reportedAt = Date.now();
    states.set(wrapper, state);
    activateIfReady(context, wrapper);
    return true;
};

export const reportFormatAgnosticCreativeSignal = (
    context: FormatAgnosticCreativeContext,
    wrapper: IAdvantageWrapper,
    iframe: HTMLIFrameElement
): void => {
    if (
        !context.config?.formatAgnosticCreatives ||
        wrapper.currentFormat ||
        !wrapper.contains(iframe)
    ) {
        return;
    }

    const states = getStates(context);
    const state = states.get(wrapper) ?? {};
    state.iframe = iframe;
    state.signaledAt = Date.now();
    states.set(wrapper, state);
    activateIfReady(context, wrapper);
};
