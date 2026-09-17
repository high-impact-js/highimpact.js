describe("Advantage core entry", () => {
    it("installs Advantage without installing High Impact JS compatibility", async () => {
        delete (window as any).highImpactJs;
        delete (window as any).googletag;
        delete (window as any).apntag;

        const core = await import("./core");

        expect(core.Advantage).toBeDefined();
        expect(typeof (window as any).advantageCmd).toBe("function");
        expect(customElements.get("advantage-wrapper")).toBeDefined();
        expect((window as any).highImpactJs).toBeUndefined();
        expect((window as any).googletag).toBeUndefined();
        expect((window as any).apntag).toBeUndefined();
    });
});
