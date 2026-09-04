const { readFileSync } = require("node:fs");
const { MessageChannel } = require("node:worker_threads");
const { JSDOM } = require("jsdom");

const dom = new JSDOM(
    [
        "<!doctype html><body>",
        '<advantage-wrapper><div slot="advantage-ad-slot"><div id="topscroll-slot"><iframe></iframe></div></div></advantage-wrapper>',
        '<advantage-wrapper><div slot="advantage-ad-slot"><div id="midscroll-slot"><iframe></iframe></div></div></advantage-wrapper>',
        "</body>"
    ].join(""),
    {
        url: "https://publisher.example",
        runScripts: "outside-only",
        pretendToBeVisual: true
    }
);

const { window } = dom;
window.MessageChannel = MessageChannel;
window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
};

let slotRenderEnded;
const pubads = {
    addEventListener: (_name, callback) => {
        slotRenderEnded = callback;
    },
    removeEventListener: () => {}
};
window.googletag = {
    cmd: { push: (callback) => callback() },
    pubads: () => pubads
};

const wait = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const sendFormatAgnosticSignal = (iframe) => {
    window.dispatchEvent(
        new window.MessageEvent("message", {
            data: JSON.stringify({
                sender: "high-impact-js",
                action: "AD_RENDERED"
            }),
            source: iframe.contentWindow
        })
    );
};

async function verify() {
    window.eval(readFileSync("dist/bundles/advantage-core.umd.cjs", "utf8"));
    window.eval(
        readFileSync("dist/bundles/advantage-core-gam.umd.cjs", "utf8")
    );

    const advantage = window.advantage.Advantage.getInstance();
    advantage.configure({
        formatAgnosticCreatives: {
            formatMappings: [
                {
                    format: window.advantage.AdvantageFormatName.TopScroll,
                    sizes: [[1, 1]]
                },
                {
                    format: window.advantage.AdvantageFormatName.Midscroll,
                    sizes: [[1, 2]]
                }
            ]
        }
    });
    window.advantageGam.connectGoogleAdManager(advantage);

    slotRenderEnded({
        slot: { getSlotElementId: () => "topscroll-slot" },
        size: [1, 1],
        isEmpty: false
    });
    slotRenderEnded({
        slot: { getSlotElementId: () => "midscroll-slot" },
        size: [1, 2],
        isEmpty: false
    });

    sendFormatAgnosticSignal(
        window.document.querySelector("#topscroll-slot iframe")
    );
    sendFormatAgnosticSignal(
        window.document.querySelector("#midscroll-slot iframe")
    );
    await wait(50);

    const formats = Array.from(
        window.document.querySelectorAll("advantage-wrapper")
    ).map((wrapper) => wrapper.getAttribute("current-format"));
    if (formats[0] !== "TOPSCROLL" || formats[1] !== "MIDSCROLL") {
        throw new Error(
            `Format-agnostic creative mapping failed: ${JSON.stringify(formats)}`
        );
    }
    if (window.highImpactJs) {
        throw new Error(
            "The lean format-agnostic installation exposed highImpactJs"
        );
    }

    console.log(
        "Format-agnostic Advantage creative verified: 1x1 → TOPSCROLL, 1x2 → MIDSCROLL"
    );
}

verify()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => dom.window.close());
