import type { AdvantageFormatOptions, MergedIntegrationConfig } from "../types";

import { getSharedState } from "./runtime";

type CompatibilityInitializer = () => Promise<void>;
type CompatibilityConfigProvider = () => Partial<MergedIntegrationConfig>;
type CompatibilityFormatOptionsProvider = (
    format: string
) => AdvantageFormatOptions | undefined;

const sharedHooks = getSharedState<{
    initialize?: CompatibilityInitializer;
    getConfig?: CompatibilityConfigProvider;
    getFormatOptions?: CompatibilityFormatOptionsProvider;
}>("compatibility-hooks", () => ({}));

/**
 * Connects the optional High Impact JS compatibility package to Advantage core.
 * Keeping this registry in core avoids importing the compatibility implementation
 * from Advantage and AdvantageWrapper.
 * @internal
 */
export const registerCompatibilityLayer = (hooks: {
    initialize: CompatibilityInitializer;
    getConfig: CompatibilityConfigProvider;
    getFormatOptions?: CompatibilityFormatOptionsProvider;
}): void => {
    sharedHooks.initialize ??= hooks.initialize;
    sharedHooks.getConfig ??= hooks.getConfig;
    sharedHooks.getFormatOptions ??= hooks.getFormatOptions;
};

/** @internal */
export const initializeRegisteredCompatibilityLayer =
    (): Promise<void> | undefined => sharedHooks.initialize?.();

/** @internal */
export const getRegisteredCompatibilityConfig =
    (): Partial<MergedIntegrationConfig> =>
        sharedHooks.getConfig?.() ?? {};

/**
 * Format options derived from the High Impact JS template config
 * (setTemplateConfig), so they also apply when a creative requests the
 * format itself instead of the compatibility layer forcing it.
 * @internal
 */
export const getRegisteredCompatibilityFormatOptions = (
    format: string
): AdvantageFormatOptions => sharedHooks.getFormatOptions?.(format) ?? {};

/** @internal */
export const isCompatibilityLayerRegistered = (): boolean =>
    sharedHooks.initialize !== undefined;
