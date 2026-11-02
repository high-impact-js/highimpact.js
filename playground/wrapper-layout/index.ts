// Registers <advantage-wrapper> with the real source on the current branch.
import "@src/advantage";

type LayoutResult = {
    case: string;
    wrapperWidth: number;
    bannerOffset: number | null;
    centered: boolean | null;
};

const measure = (): LayoutResult[] =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-case]")).map(
        (parent) => {
            const wrapper = parent.querySelector("advantage-wrapper")!;
            const banner = parent.querySelector<HTMLElement>(".banner");
            const p = parent.getBoundingClientRect();
            const w = wrapper.getBoundingClientRect();
            if (!banner) {
                return {
                    case: parent.dataset.case!,
                    wrapperWidth: Math.round(w.width),
                    bannerOffset: null,
                    centered: null
                };
            }
            const b = banner.getBoundingClientRect();
            const parentCenter = p.left + p.width / 2;
            const bannerCenter = b.left + b.width / 2;
            return {
                case: parent.dataset.case!,
                wrapperWidth: Math.round(w.width),
                bannerOffset: Math.round(b.left - p.left),
                centered: Math.abs(bannerCenter - parentCenter) < 1
            };
        }
    );

customElements.whenDefined("advantage-wrapper").then(() => {
    requestAnimationFrame(() => {
        const results = measure();
        (window as any).wrapperLayoutResults = results;
        console.table(results);
        const tbody = document.querySelector("#results tbody")!;
        tbody.innerHTML = results
            .map(
                (r) =>
                    `<tr><td>${r.case}</td><td>${r.wrapperWidth}px</td><td>${
                        r.bannerOffset ?? "–"
                    }</td><td>${r.centered ?? "–"}</td></tr>`
            )
            .join("");
        document.body.dataset.measured = "true";
    });
});
