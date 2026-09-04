import { Advantage, AdvantageFormatName } from "@src/advantage/core";
import { connectGoogleAdManager } from "@src/advantage/ad-servers/gam";

/* 

This is the code that the publisher should include in their website.

*/

const advantage = Advantage.getInstance();

advantage.configure({
    formatAgnosticCreatives: {
        formatMappings: [
            {
                format: AdvantageFormatName.TopScroll,
                sizes: [[2, 2]]
            },
            {
                format: AdvantageFormatName.Midscroll,
                sizes: [[1, 1]]
            }
        ]
    },
    formatIntegrations: [
        {
            format: AdvantageFormatName.TopScroll,
            setup: () => {
                return new Promise<void>((resolve) => {
                    /* Setup your site to accomodate the topscroll format here.
                    Perhaps you might need to hide a sticky header menu or similar. */

                    // call resolve when done
                    resolve();
                });
            }
            /*
            close: () => {
                console.log("Closing top scroll format");
            }
            reset: () => {
                console.log("Resetting top scroll format");
            }
            */
        },
        {
            format: AdvantageFormatName.Midscroll,
            setup: () => {
                return new Promise<void>((resolve) => {
                    /* Setup your site to accomodate the Midscroll format here.
                    Perhaps you might need to adjust the wrapper to occupy 100% of page width or similar. */

                    // call resolve when done
                    resolve();
                });
            }
        }
    ]
});

// Forward GAM's booked size to Advantage. A format-agnostic creative can now
// send AD_RENDERED and let the publisher's size mapping select the format.
connectGoogleAdManager(advantage);
