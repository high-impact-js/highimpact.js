import type { MergedIntegrationConfig } from "../types";

import { getSharedState } from "./runtime";

type CompatibilityInitializer = () => Promise<void>;
type CompatibilityConfigProvider = () => Partial<MergedIntegrationConfig>;

const sharedHooks = getSharedState<{
    initialize?: CompatibilityInitializer;
    getConfig?: CompatibilityConfigProvider;
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
}): void => {
    sharedHooks.initialize ??= hooks.initialize;
    sharedHooks.getConfig ??= hooks.getConfig;
};

/** @internal */
export const initializeRegisteredCompatibilityLayer =
    (): Promise<void> | undefined => sharedHooks.initialize?.();

/** @internal */
export const getRegisteredCompatibilityConfig =
    (): Partial<MergedIntegrationConfig> =>
        sharedHooks.getConfig?.() ?? {};

/** @internal */
export const isCompatibilityLayerRegistered = (): boolean =>
    sharedHooks.initialize !== undefined;
