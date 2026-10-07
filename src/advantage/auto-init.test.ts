import { Advantage, setConfig } from "./index";

jest.mock("./auto-init-config", () => ({
    __esModule: true,
    default: { formatIntegrations: [{ format: "REMOTE", setup: async () => {} }] }
}), { virtual: true });

const flushLoad = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("High Impact JS auto-initialization", () => {
    it("does not supersede a pending remote configuration", async () => {
        const advantage = Advantage.getInstance();
        advantage.configure({ configUrlResolver: () => "./auto-init-config" });
        expect(advantage.isConfigLoading).toBe(true);

        setConfig({ topBarHeight: 50 });
        await flushLoad();

        expect(advantage.isConfigLoading).toBe(false);
        expect([...advantage.formatIntegrations.keys()]).toEqual(["REMOTE"]);
    });
});
