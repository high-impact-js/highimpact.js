// Layout checks for <advantage-wrapper> with no format applied (issue #28, PR #30).
// Needs the dev server: `npm run dev` (Vite, port 5173).
const URL = "http://localhost:5173/playground/wrapper-layout/";

type LayoutResult = {
    case: string;
    wrapperWidth: number;
    bannerOffset: number | null;
    centered: boolean | null;
};

const PARENT_WIDTH = 700;

const results = () =>
    cy
        .visit(URL)
        .get("body[data-measured='true']")
        .window()
        .its("wrapperLayoutResults") as Cypress.Chainable<LayoutResult[]>;

const byCase = (all: LayoutResult[], name: string) =>
    all.find((r) => r.case === name)!;

describe("advantage-wrapper layout without a format", () => {
    beforeEach(() => cy.viewport(1280, 900));

    it("does not collapse to 0px around fixed-position content (issue #28)", () => {
        results().then((all) => {
            expect(byCase(all, "interscroller").wrapperWidth).to.equal(PARENT_WIDTH);
        });
    });

    for (const name of ["block-text-center", "block-plain"]) {
        it(`fills a block parent: ${name}`, () => {
            results().then((all) => {
                expect(byCase(all, name).wrapperWidth).to.equal(PARENT_WIDTH);
            });
        });
    }

    it("keeps an inline banner centred with text-align:center", () => {
        results().then((all) => {
            expect(byCase(all, "block-text-center").centered).to.equal(true);
        });
    });

    // Known trade-off: the wrapper fills its container, so a narrower banner
    // in a parent that centres via flex/grid alignment sits at the left edge.
    // Publishers who need it centred can set margin:auto on the ad, or their
    // own width on advantage-wrapper. If this starts failing, the default changed.
    for (const name of ["flex-col-center", "flex-row-center", "grid-center"]) {
        it(`fills a flex/grid centring parent, banner left-aligned: ${name}`, () => {
            results().then((all) => {
                const r = byCase(all, name);
                expect(r.wrapperWidth, JSON.stringify(r)).to.equal(PARENT_WIDTH);
                expect(r.bannerOffset, JSON.stringify(r)).to.equal(0);
            });
        });
    }
});
