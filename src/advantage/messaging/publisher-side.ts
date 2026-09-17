import {
    IAdvantageWrapper,
    AdvantageAd,
    AdvantageMessage,
    AdvantageMessageAction
} from "../../types";
import { Advantage } from "../advantage";
import { isCompatibilityLayerRegistered } from "../compatibility-registry";
import { reportFormatAgnosticCreativeSignal } from "../format-agnostic-creative";
import { collectIframes, logger, ADVANTAGE } from "../../utils";

const isFormatAgnosticCreativeSignal = (event: MessageEvent): boolean => {
    let data = event.data;
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (_) {
            return false;
        }
    }

    return (
        data?.type === "high-impact-ad-responsive" ||
        (data?.sender === "high-impact-js" && data?.action === "AD_RENDERED")
    );
};

/**
 * AdvantageAdSlotResponder can be used by website owners/publishers if they already have their own custom implementations of high impact ad formats
 * or if they do not want to use the AdvantageWrapper component for some reason. It takes care of listening for messages from Advantage ads and handling them.
 * It will handle the creation of a new session, format requests, and format confirmations.
 * @public
 * @remarks
 * This class is internally used by the AdvantageWrapper component to handle messages from Advantage ads. It can also be used by website owners/publishers to handle messages from ads if they have their own custom implementations of high-impact ad formats.
 *
 * @example
 * To handle messages from Advantage ads in a custom implementation, you can create an instance of the AdvantageAdSlotResponder class and pass in the configuration object.
 * ```typescript
 * new AdvantageAdSlotResponder({
 *      adSlotElement: document.querySelector("#the-ad-slot-element")!,
 *      formatRequestHandler: (format, parentElement) => {
 *           return new Promise((resolve, reject) => {
 *              // handle the format request here, e.g. by transforming the parent element into the requested format
 *              // resolve the promise if the format transformation was succesful or reject it if it failed
 *          });
 * });
 * ```
 */
export class AdvantageAdSlotResponder {
    #element: HTMLElement | IAdvantageWrapper;
    #messageValidator:
        | ((
              adSlotElement: HTMLElement | IAdvantageWrapper,
              message: MessageEvent<any>
          ) => boolean)
        | undefined = undefined;
    #defaultMessageValidator(
        _adSlotElement: HTMLElement | IAdvantageWrapper,
        event: MessageEvent<AdvantageMessage>
    ): boolean {
        // Basic validation - check if message has expected properties
        if (!event.data || typeof event.data !== "object") {
            return false;
        }

        // Check if the message has a type field that matches ADVANTAGE
        if (event.data.type !== "ADVANTAGE") {
            return false;
        }

        // Check for essential action property
        if (!event.data.action) {
            return false;
        }

        return true;
    }
    #isWrapper: boolean;
    #messagePort: MessagePort | null = null;
    #formatRequestHandler:
        | ((format: string, parentElement: HTMLElement) => Promise<void>)
        | undefined = undefined;
    ad: AdvantageAd | null = null;
    /**
     * Constructs a new instance of the AdvantageAdSlotResponder, initializing it with the provided configuration.
     *
     * @param config - The configuration object for the class instance.
     * @param config.adSlotElement - The HTML element that is/contains the ad slot where Advantage ads will loaded/displayed.
     * @param config.formatRequestHandler - An optional function that handles format requests. It takes a format string and a parent element as arguments. This function can be used to customize the handling of different ad formats.
     * @param config.messageValidator - An optional function that validates incoming messages. It takes a parent element (which can be an `HTMLElement` or an `IAdvantageWrapper`) and the message event as arguments. It should return a boolean indicating whether the message is valid.
     */
    constructor(config: {
        adSlotElement: HTMLElement;
        formatRequestHandler?: (
            format: string,
            parentElement: HTMLElement
        ) => Promise<void>;
        messageValidator?: (
            parentElement: HTMLElement | IAdvantageWrapper,
            message: MessageEvent<any>
        ) => boolean;
    }) {
        if (!config.adSlotElement) {
            throw new Error("An adSlotElement must be provided");
        }
        this.#element = config.adSlotElement;
        this.#formatRequestHandler = config.formatRequestHandler;
        this.#messageValidator = config.messageValidator;
        this.#isWrapper = this.#isAdvantageWrapper(config.adSlotElement);

        if (!this.#isWrapper) {
            /* Advantage wrappers will report themselves to the Advantage instance
            But since this is a custom wrapper, we need to register it manually */
            Advantage.getInstance().registerCustomWrapper(config.adSlotElement);
        }
        // Bind the listenForMessages function to ensure 'this' context
        this.#listenForMessages = this.#listenForMessages.bind(this);
        window.addEventListener("message", this.#listenForMessages);
    }
    /**
     * This method handles incoming messages from Advantage ads and processes them accordingly.
     * @internal
     */
    #handleMessage = async (event: MessageEvent<AdvantageMessage>) => {
        // Handle the message here
        const message = event.data;
        // The message is a request to start a session
        if (message.action === AdvantageMessageAction.START_SESSION) {
            logger.debug("start session!", event);

            // A new session starting means a new ad has loaded. If the wrapper still
            // has an active format from a previous session, reset it now so stale
            // styles and state are cleared before the new ad can request a format.
            if (this.#isWrapper) {
                const wrapper = this.#element as IAdvantageWrapper;
                if (wrapper.currentFormat) {
                    logger.info(
                        `New START_SESSION received while format "${wrapper.currentFormat}" is active. ` +
                            "Resetting the wrapper."
                    );
                    wrapper.reset();
                }
            }

            this.#messagePort = event.ports[0];
            this.#messagePort.postMessage({
                type: ADVANTAGE,
                action: AdvantageMessageAction.CONFIRM_SESSION,
                sessionID: message.sessionID
            });
            this.#messagePort.onmessage = this.#handleMessage.bind(this);
        }
        if (message.action === AdvantageMessageAction.REQUEST_FORMAT) {
            if (this.#isWrapper) {
                (this.#element as IAdvantageWrapper)
                    .morphIntoFormat(message.format!, message)
                    .then(() => {
                        logger.info("morphed into format", message.format!);
                        this.#messagePort?.postMessage({
                            type: ADVANTAGE,
                            action: AdvantageMessageAction.FORMAT_CONFIRMED,
                            sessionID: message.sessionID
                        });
                    })
                    .catch((error) => {
                        logger.error("morphing failed", message.format!, error);
                        this.#messagePort?.postMessage({
                            type: ADVANTAGE,
                            action: AdvantageMessageAction.FORMAT_REJECTED,
                            sessionID: message.sessionID
                        });
                    });
            } else {
                if (this.#formatRequestHandler) {
                    logger.debug(
                        "Sending format request",
                        this.#formatRequestHandler
                    );
                    this.#formatRequestHandler(message.format!, this.#element)
                        .then(() => {
                            this.#messagePort?.postMessage({
                                type: ADVANTAGE,
                                action: AdvantageMessageAction.FORMAT_CONFIRMED,
                                sessionID: message.sessionID
                            });
                        })
                        .catch(() => {
                            this.#messagePort?.postMessage({
                                type: ADVANTAGE,
                                action: AdvantageMessageAction.FORMAT_REJECTED,
                                sessionID: message.sessionID
                            });
                        });
                }
            }
        }
    };
    /**
     * Checks if the message is from an ad that is already registered
     * @internal
     */
    #childAdIsAlreadyRegistered(source: MessageEventSource | null) {
        if (!source) {
            return false;
        }
        return this.ad && this.ad.eventSource === source;
    }

    /**
     * This method listens for incoming messages from Advantage ads and processes them accordingly.
     * @internal
     */
    #listenForMessages = (event: MessageEvent) => {
        const isFormatAgnosticSignal =
            this.#isWrapper &&
            !isCompatibilityLayerRegistered() &&
            !!Advantage.getInstance().config?.formatAgnosticCreatives &&
            isFormatAgnosticCreativeSignal(event);

        if (
            !isFormatAgnosticSignal &&
            this.#childAdIsAlreadyRegistered(event.source)
        ) {
            logger.info(
                "A message was received from a child of the component. 👍",
                event
            );
            this.#handleMessage(event as MessageEvent<AdvantageMessage>);
            return;
        }

        if (!isFormatAgnosticSignal) {
            const validator =
                this.#messageValidator ||
                this.#defaultMessageValidator.bind(this);
            if (!validator(this.#element, event)) {
                return;
            }
        }

        const childAdFinder = (iframe: HTMLIFrameElement) => {
            /*
             * The message is from an iframe. We need to check if the iframe is a child of the component.
             * This is done by checking if the iframe.contentWindow is equal to the event.source.
             * If it is, we can be sure that the message is from a child of the component.
             * But the event can also be from a child of a child of the component.
             */
            const MAX_ITERATIONS = 10;
            let iterations = 0;
            let currentWindow: Window | null = event.source as Window;

            while (
                currentWindow &&
                currentWindow !== window.top &&
                iterations < MAX_ITERATIONS
            ) {
                iterations++;
                try {
                    if (iframe.contentWindow === currentWindow) {
                        logger.info(
                            "The message is from a child of the component. 👍"
                        );
                        if (isFormatAgnosticSignal) {
                            reportFormatAgnosticCreativeSignal(
                                Advantage.getInstance(),
                                this.#element as IAdvantageWrapper,
                                iframe
                            );
                            break;
                        }
                        this.ad = {
                            iframe,
                            eventSource: event.source!,
                            port: event.ports[0]
                        };
                        this.#handleMessage(
                            event as MessageEvent<AdvantageMessage>
                        );
                        break;
                    }
                    currentWindow = currentWindow.parent;
                } catch (error) {
                    logger.error(
                        "Error while traversing iframe hierarchy",
                        error
                    );
                    break;
                }
            }
        };
        if (this.#isWrapper) {
            const iframes = (
                this.#element as IAdvantageWrapper
            ).contentNodes.flatMap((node) => collectIframes(node));
            if (iframes.length === 0) {
                return;
            }
            iframes.forEach(childAdFinder);
        } else {
            // Check if the source window is a child of the #element
            logger.debug("NOT A WRAPPER!", this.#element);
            Array.from(this.#element.getElementsByTagName("iframe")).forEach(
                childAdFinder
            );
        }
    };
    /**
     * Checks if the provided element is an instance of IAdvantageWrapper.
     * @internal
     */
    #isAdvantageWrapper(
        element: HTMLElement | IAdvantageWrapper
    ): element is IAdvantageWrapper {
        return (
            "container" in element &&
            "currentFormat" in element &&
            "uiLayer" in element &&
            "morphIntoFormat" in element
        );
    }

    /**
     * Sends a message to the creative through the established MessagePort channel.
     * This method ensures messages are delivered even when the creative is nested in multiple iframes.
     * 
     * @param message - The message to send to the creative
     * @returns true if the message was sent successfully, false if no message channel is established
     * 
     * @public
     * @example
     * ```typescript
     * // Send a scroll progress update to the creative
     * responder.sendMessage({
     *     type: 'advantage',
     *     action: 'SCROLL_PROGRESS',
     *     progress: 0.5
     * });
     * ```
     */
    sendMessage(message: Partial<AdvantageMessage>): boolean {
        if (!this.#messagePort) {
            logger.debug('Cannot send message: MessagePort not established');
            return false;
        }

        try {
            this.#messagePort.postMessage({
                type: ADVANTAGE,
                ...message
            });
            return true;
        } catch (error) {
            logger.error('Failed to send message via MessagePort:', error);
            return false;
        }
    }
}
