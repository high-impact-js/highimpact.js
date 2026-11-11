// Layout checks for <advantage-wrapper> with no format applied.
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

// Without a format the wrapper lays out like the ad element it wraps, so a
// banner lands where it would without the wrapper.
describe("advantage-wrapper layout without a format", () => {
    beforeEach(() => cy.viewport(1280, 900));

    for (const name of ["flex-col-center", "flex-row-center", "grid-center"]) {
        it(`keeps a banner centred by a flex/grid parent: ${name}`, () => {
            results().then((all) => {
                const r = byCase(all, name);
                expect(r.centered, JSON.stringify(r)).to.equal(true);
            });
        });
    }

    it("keeps an inline banner centred with text-align:center", () => {
        results().then((all) => {
            expect(byCase(all, "block-text-center").centered).to.equal(true);
        });
    });

    it("leaves a banner at the start of a plain block parent", () => {
        results().then((all) => {
            expect(byCase(all, "block-plain").bannerOffset).to.equal(0);
        });
    });

    // Fixed-position content gives the wrapper no width to size itself by, so
    // a shrinking parent collapses it. Publishers with such custom templates
    // add their own width rule (see the Wrapper docs, "Layout").
    it("collapses around fixed-position content without a publisher rule", () => {
        results().then((all) => {
            expect(byCase(all, "interscroller").wrapperWidth).to.equal(0);
        });
    });

    it("fills the parent around fixed-position content with a publisher rule", () => {
        results().then((all) => {
            expect(byCase(all, "interscroller-with-rule").wrapperWidth).to.equal(
                PARENT_WIDTH
            );
        });
    });
});
