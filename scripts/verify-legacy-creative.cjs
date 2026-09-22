const { readFileSync } = require("node:fs");
const { MessageChannel } = require("node:worker_threads");
const { JSDOM } = require("jsdom");

const dom = new JSDOM(
    '<!doctype html><body><div id="test-slot"><iframe id="google_ads_iframe_test-slot"></iframe></div></body>',
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

const slot = {
    getSlotElementId: () => "test-slot",
    getHtml: () => "<creative>",
    size: [970, 250]
};
const pubads = {
    addEventListener: () => {},
    getSlots: () => [slot],
    getSlotIdMap: () => ({ "test-slot": slot })
};
window.googletag = {
    cmd: { push: (callback) => callback() },
    pubads: () => pubads
};

const wait = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function verify() {
    window.eval(readFileSync("dist/bundles/advantage.umd.cjs", "utf8"));
    window.highImpactJs.setConfig({ plugins: ["gam"] });
    window.highImpactJs.setTemplateConfig("topscroll", {
        showCloseButton: false
    });
    window.highImpactJs.defineSlot({
        adUnitId: "test-slot",
        template: "topscroll",
        sizes: [[970, 250]],
        waitForAdSignal: true
    });

    await wait(10);
    const iframe = window.document.querySelector("iframe");
    window.dispatchEvent(
        new window.MessageEvent("message", {
            data: JSON.stringify({
                sender: "high-impact-js",
                action: "AD_RENDERED"
            }),
            source: iframe.contentWindow
        })
    );

    await wait(50);
    const wrapper = window.document.querySelector("advantage-wrapper");
    if (wrapper?.getAttribute("current-format") !== "TOPSCROLL") {
        throw new Error(
            "The full bundle did not activate TOPSCROLL for a legacy AD_RENDERED creative signal"
        );
    }

    console.log("Legacy High Impact JS creative signal verified");
}

verify()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => dom.window.close());
