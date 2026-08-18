import { ADVANTAGE, sendMessageAndOpenChannel } from "./messaging";

describe("sendMessageAndOpenChannel", () => {
    it("should export ADVANTAGE constant", () => {
        expect(ADVANTAGE).toBe("ADVANTAGE");
    });

    it("should be importable without errors", () => {
        expect(typeof sendMessageAndOpenChannel).toBe("function");
    });
});
