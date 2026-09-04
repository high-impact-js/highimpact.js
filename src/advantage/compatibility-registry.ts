import type { MergedIntegrationConfig } from "../types";

type CompatibilityInitializer = () => Promise<void>;
type CompatibilityConfigProvider = () => Partial<MergedIntegrationConfig>;

let initializeCompatibilityLayer: CompatibilityInitializer | undefined;
let compatibilityConfigProvider: CompatibilityConfigProvider | undefined;

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
    initializeCompatibilityLayer = hooks.initialize;
    compatibilityConfigProvider = hooks.getConfig;
};

/** @internal */
export const initializeRegisteredCompatibilityLayer =
    (): Promise<void> | undefined => initializeCompatibilityLayer?.();

/** @internal */
export const getRegisteredCompatibilityConfig =
    (): Partial<MergedIntegrationConfig> =>
        compatibilityConfigProvider?.() ?? {};

/** @internal */
export const isCompatibilityLayerRegistered = (): boolean =>
    initializeCompatibilityLayer !== undefined;
