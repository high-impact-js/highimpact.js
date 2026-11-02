/**
 * @jest-environment node
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cli = require("./highimpact.cjs");

let temp: string;
const quiet = () => undefined;

function write(file: string, content: string) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
}

function fakePackage(dir: string, version = "1.2.3") {
    write(path.join(dir, "package.json"), JSON.stringify({ name: "highimpact.js", version }));
    write(path.join(dir, "ai/index.md"), "# index\n");
}

function project(dir: string) {
    write(path.join(dir, "package.json"), JSON.stringify({ name: "consumer" }));
    return dir;
}

function blockCount(text: string) {
    return text.split(cli.START).length - 1;
}

beforeEach(() => {
    temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "hijs-cli-")));
});

afterEach(() => {
    fs.rmSync(temp, { recursive: true, force: true });
});

describe("setup-ai", () => {
    it("creates AGENTS.md pointing at a flat install", () => {
        const app = project(path.join(temp, "app"));
        fakePackage(path.join(app, "node_modules/highimpact.js"));

        const result = cli.setupAi({ cwd: app, log: quiet });

        expect(result.action).toBe("created");
        const text = fs.readFileSync(path.join(app, "AGENTS.md"), "utf8");
        expect(text).toBe(cli.managedBlock("node_modules/highimpact.js/ai/index.md", "\n") + "\n");
    });

    it("finds the project root from a nested directory", () => {
        const app = project(path.join(temp, "app"));
        fakePackage(path.join(app, "node_modules/highimpact.js"));
        fs.mkdirSync(path.join(app, "src/components"), { recursive: true });

        cli.setupAi({ cwd: path.join(app, "src/components"), log: quiet });

        expect(fs.existsSync(path.join(app, "AGENTS.md"))).toBe(true);
    });

    it("uses a relative path to a package hoisted to the workspace root", () => {
        project(temp);
        const app = project(path.join(temp, "packages/site"));
        fakePackage(path.join(temp, "node_modules/highimpact.js"));

        const result = cli.setupAi({ cwd: app, log: quiet });

        expect(result.indexPath).toBe("../../node_modules/highimpact.js/ai/index.md");
    });

    it("keeps the symlinked path of pnpm installs so it survives upgrades", () => {
        const app = project(path.join(temp, "app"));
        const store = path.join(app, "node_modules/.pnpm/highimpact.js@1.2.3/node_modules/highimpact.js");
        fakePackage(store);
        fs.symlinkSync(store, path.join(app, "node_modules/highimpact.js"), "junction");

        const result = cli.setupAi({ cwd: app, log: quiet });

        expect(result.indexPath).toBe("node_modules/highimpact.js/ai/index.md");
    });

    it("preserves existing content and appends one block", () => {
        const app = project(path.join(temp, "app"));
        fakePackage(path.join(app, "node_modules/highimpact.js"));
        write(path.join(app, "AGENTS.md"), "# Team rules\n\nUse tabs.\n");

        cli.setupAi({ cwd: app, log: quiet });
        const text = fs.readFileSync(path.join(app, "AGENTS.md"), "utf8");

        expect(text.startsWith("# Team rules\n\nUse tabs.\n\n" + cli.START)).toBe(true);
        expect(text.endsWith(cli.END + "\n")).toBe(true);
    });

    it("is idempotent and updates the block in place", () => {
        const app = project(path.join(temp, "app"));
        fakePackage(path.join(app, "node_modules/highimpact.js"));
        const stale = cli.managedBlock("old/path/ai/index.md", "\n");
        write(path.join(app, "AGENTS.md"), `# Before\n\n${stale}\n\n# After\n`);

        expect(cli.setupAi({ cwd: app, log: quiet }).action).toBe("updated");
        const once = fs.readFileSync(path.join(app, "AGENTS.md"), "utf8");
        expect(cli.setupAi({ cwd: app, log: quiet }).action).toBe("unchanged");
        const twice = fs.readFileSync(path.join(app, "AGENTS.md"), "utf8");

        expect(twice).toBe(once);
        expect(blockCount(twice)).toBe(1);
        expect(twice).toBe(`# Before\n\n${cli.managedBlock("node_modules/highimpact.js/ai/index.md", "\n")}\n\n# After\n`);
    });

    it("collapses duplicate blocks into one", () => {
        const block = cli.managedBlock("x", "\n");
        const result = cli.upsertBlock(`a\n\n${block}\n\nb\n\n${block}\n`, cli.managedBlock("y", "\n"), "\n");
        expect(blockCount(result)).toBe(1);
        expect(result).toBe(`a\n\n${cli.managedBlock("y", "\n")}\n\nb\n`);
    });

    it("keeps CRLF line endings", () => {
        const app = project(path.join(temp, "app"));
        fakePackage(path.join(app, "node_modules/highimpact.js"));
        write(path.join(app, "AGENTS.md"), "# Rules\r\n");

        cli.setupAi({ cwd: app, log: quiet });
        const text = fs.readFileSync(path.join(app, "AGENTS.md"), "utf8");

        expect(text.replace(/\r\n/g, "")).not.toMatch(/\n/);
    });

    it("writes CLAUDE.md with --claude", () => {
        const app = project(path.join(temp, "app"));
        fakePackage(path.join(app, "node_modules/highimpact.js"));

        cli.setupAi({ cwd: app, claude: true, log: quiet });

        expect(fs.existsSync(path.join(app, "CLAUDE.md"))).toBe(true);
        expect(fs.existsSync(path.join(app, "AGENTS.md"))).toBe(false);
    });

    it("refuses unbalanced markers instead of guessing", () => {
        const app = project(path.join(temp, "app"));
        fakePackage(path.join(app, "node_modules/highimpact.js"));
        write(path.join(app, "AGENTS.md"), `${cli.START}\nhalf a block\n`);

        expect(() => cli.setupAi({ cwd: app, log: quiet })).toThrow(/unmatched/);
        expect(fs.readFileSync(path.join(app, "AGENTS.md"), "utf8")).toBe(`${cli.START}\nhalf a block\n`);
    });

    it("explains how to fix a missing install", () => {
        const app = project(path.join(temp, "app"));
        expect(() => cli.setupAi({ cwd: app, log: quiet })).toThrow(/npm install highimpact\.js/);
        expect(fs.existsSync(path.join(app, "AGENTS.md"))).toBe(false);
    });

    it("explains that Yarn Plug'n'Play is unsupported", () => {
        const app = project(path.join(temp, "app"));
        write(path.join(app, ".pnp.cjs"), "");
        expect(() => cli.setupAi({ cwd: app, log: quiet })).toThrow(/Plug'n'Play/);
    });

    it("rejects releases without AI docs", () => {
        const app = project(path.join(temp, "app"));
        write(path.join(app, "node_modules/highimpact.js/package.json"), JSON.stringify({ name: "highimpact.js", version: "0.14.3" }));
        expect(() => cli.setupAi({ cwd: app, log: quiet })).toThrow(/does not include ai\/index\.md/);
    });
});

describe("setup-ai --remove", () => {
    it("removes only the managed block", () => {
        const app = project(path.join(temp, "app"));
        const original = "# Team rules\n\nUse tabs.\n";
        write(path.join(app, "AGENTS.md"), original);
        fakePackage(path.join(app, "node_modules/highimpact.js"));
        cli.setupAi({ cwd: app, log: quiet });

        expect(cli.setupAi({ cwd: app, remove: true, log: quiet }).action).toBe("removed");

        expect(fs.readFileSync(path.join(app, "AGENTS.md"), "utf8")).toBe(original);
    });

    it("removes a block between other sections", () => {
        const block = cli.managedBlock("x", "\n");
        expect(cli.removeBlocks(`# A\n\n${block}\n\n# B\n`, "\n").text).toBe("# A\n\n# B\n");
        expect(cli.removeBlocks(`${block}\n\n# B\n`, "\n").text).toBe("# B\n");
        expect(cli.removeBlocks(`${block}\n`, "\n").text).toBe("");
    });

    it("works without an installed package and leaves missing files alone", () => {
        const app = project(path.join(temp, "app"));
        expect(cli.setupAi({ cwd: app, remove: true, log: quiet }).action).toBe("none");
        expect(fs.existsSync(path.join(app, "AGENTS.md"))).toBe(false);
    });
});
