import { collectIframes, traverseNodes } from "./misc";
import { jest } from "@jest/globals";
import { JSDOM } from "jsdom";

describe("collectIframes", () => {
    it("should collect all iframes within a given node and its children", () => {
        // Create a test node with iframes
        const { window } = new JSDOM();
        global.Node = window.Node;
        const testNode = window.document.createElement("div");
        const iframe1 = window.document.createElement("iframe");
        const iframe2 = window.document.createElement("iframe");
        testNode.appendChild(iframe1);
        testNode.appendChild(iframe2);

        // Call the collectIframes function
        const result = collectIframes(testNode);

        // Assert that the result contains the iframes
        expect(result).toContain(iframe1);
        expect(result).toContain(iframe2);
    });
});

describe("traverseNodes", () => {
    it("should apply a function to each element node in the DOM tree", () => {
        // Create a test DOM tree
        const { window } = new JSDOM(`
            <div id="base">
                <p id="p1">Paragraph 1</p>
                <p id="p2">Paragraph 2</p>
                <div id="container">
                    <span id="span1">Span 1</span>
                    <span id="span2">Span 2</span>
                </div>
            </div>
        `);
        global.Node = window.Node;
        const testNode = window.document.querySelector("div");

        // Mock function to be applied to each element node
        const mockFunc = jest.fn();

        // Add a null check before calling traverseNodes
        if (testNode) {
            traverseNodes(testNode, mockFunc);
        }

        // Assert that the mock function was called for each element node
        expect(mockFunc).toHaveBeenCalledTimes(6);
        expect(mockFunc).toHaveBeenCalledWith(
            window.document.getElementById("base")
        );
        expect(mockFunc).toHaveBeenCalledWith(
            window.document.getElementById("container")
        );
        expect(mockFunc).toHaveBeenCalledWith(
            window.document.getElementById("p1")
        );
        expect(mockFunc).toHaveBeenCalledWith(
            window.document.getElementById("p2")
        );
        expect(mockFunc).toHaveBeenCalledWith(
            window.document.getElementById("span1")
        );
        expect(mockFunc).toHaveBeenCalledWith(
            window.document.getElementById("span2")
        );
    });
});
