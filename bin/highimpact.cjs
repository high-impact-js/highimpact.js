#!/usr/bin/env node
"use strict";
// Opt-in helpers that point coding agents at the documentation shipped with the
// installed highimpact.js release. Nothing here runs on install.
const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_NAME = "highimpact.js";
const START = "<!-- highimpact.js:start -->";
const END = "<!-- highimpact.js:end -->";
const PACKAGE_ROOT = path.resolve(__dirname, "..");

const USAGE = `Usage: npx ${PACKAGE_NAME} <command> [options]

Commands:
  setup-ai    Add or update the highimpact.js block in AGENTS.md
  info        Print the installed version and the location of its AI docs

Options for setup-ai:
  --claude      Write CLAUDE.md instead of AGENTS.md
  --remove      Remove the managed block and leave other content untouched
  --dir <path>  Project directory (default: nearest package.json above cwd)
`;

class CliError extends Error {}

function toPosix(p) {
    return p.split(path.sep).join("/");
}

/** Nearest directory at or above `start` that has a package.json. */
function findProjectRoot(start) {
    let dir = path.resolve(start);
    for (;;) {
        if (fs.existsSync(path.join(dir, "package.json"))) {
            if (dir.split(path.sep).includes("node_modules")) {
                throw new CliError(`${dir} is inside node_modules. Run this command from your own project, or pass --dir.`);
            }
            return dir;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            throw new CliError(`No package.json found at or above ${start}. Run this command from your project, or pass --dir.`);
        }
        dir = parent;
    }
}

/**
 * Locate node_modules/highimpact.js the way Node resolves it from `projectDir`
 * (walking up through parent node_modules folders, which covers hoisted
 * workspaces) without following symlinks, so pnpm installs keep a stable path
 * that survives upgrades.
 */
function findInstalledPackage(projectDir) {
    let dir = path.resolve(projectDir);
    for (;;) {
        if (fs.existsSync(path.join(dir, ".pnp.cjs")) && !fs.existsSync(path.join(dir, "node_modules", PACKAGE_NAME))) {
            throw new CliError(
                `Yarn Plug'n'Play was detected in ${dir}. Agents cannot read files inside the Yarn cache, so setup-ai is unsupported here.\n` +
                    `Use "nodeLinker: node-modules" in .yarnrc.yml, or point your agent at https://gethighimpact.org/docs/ manually.`
            );
        }
        const candidate = path.join(dir, "node_modules", PACKAGE_NAME);
        const manifest = path.join(candidate, "package.json");
        if (fs.existsSync(manifest)) {
            const { name, version } = JSON.parse(fs.readFileSync(manifest, "utf8"));
            if (name === PACKAGE_NAME) {
                if (!fs.existsSync(path.join(candidate, "ai", "index.md"))) {
                    throw new CliError(`${candidate} (version ${version}) does not include ai/index.md. Upgrade highimpact.js and run setup-ai again.`);
                }
                return { dir: candidate, version };
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            throw new CliError(
                `${PACKAGE_NAME} is not installed for ${projectDir}.\n` +
                    `Install it first (npm install ${PACKAGE_NAME}), or pass --dir with the workspace package that depends on it.`
            );
        }
        dir = parent;
    }
}

function managedBlock(indexPath, eol) {
    return [
        START,
        "## highimpact.js",
        "",
        "When integrating or debugging highimpact.js, read",
        `${indexPath} first.`,
        "Use the installed package's documentation and type declarations",
        "for version-specific APIs.",
        END
    ].join(eol);
}

/** Return the positions of every managed block, or throw on unbalanced markers. */
function findBlocks(text) {
    const blocks = [];
    let from = 0;
    for (;;) {
        const start = text.indexOf(START, from);
        const end = text.indexOf(END, from);
        if (start === -1 && end === -1) return blocks;
        if (start === -1 || end === -1 || end < start) {
            throw new CliError(`Found an unmatched highimpact.js marker. Fix or delete the lines between "${START}" and "${END}" and try again.`);
        }
        const nextStart = text.indexOf(START, start + START.length);
        if (nextStart !== -1 && nextStart < end) {
            throw new CliError(`Found an unmatched highimpact.js marker. Fix or delete the lines between "${START}" and "${END}" and try again.`);
        }
        blocks.push([start, end + END.length]);
        from = end + END.length;
    }
}

/** Insert or replace the managed block, keeping all other text untouched. */
function upsertBlock(text, block, eol) {
    const blocks = findBlocks(text);
    if (blocks.length === 0) {
        if (text.trim() === "") return block + eol;
        const trimmed = text.replace(/\s*$/, "");
        return trimmed + eol + eol + block + eol;
    }
    // Replace the first block and drop any duplicates, last to first.
    let result = text;
    for (let i = blocks.length - 1; i >= 1; i--) result = removeRange(result, blocks[i], eol);
    const [start, end] = blocks[0];
    return result.slice(0, start) + block + result.slice(end);
}

/** Cut a block and the blank line that separated it from its neighbours. */
function removeRange(text, [start, end], eol) {
    const before = text.slice(0, start);
    const after = text.slice(end).replace(/^\r?\n/, "");
    if (before.trim() === "") return after.replace(/^(\r?\n)+/, "");
    if (after.trim() === "") return before.replace(/(\r?\n)+$/, "") + eol;
    if (/\r?\n\r?\n$/.test(before) && /^\r?\n/.test(after)) return before + after.replace(/^\r?\n/, "");
    return before + after;
}

function removeBlocks(text, eol) {
    const blocks = findBlocks(text);
    let result = text;
    for (let i = blocks.length - 1; i >= 0; i--) result = removeRange(result, blocks[i], eol);
    return { text: result, removed: blocks.length };
}

function setupAi({ cwd = process.cwd(), dir, claude = false, remove = false, log = console.log } = {}) {
    const projectDir = dir ? path.resolve(cwd, dir) : findProjectRoot(cwd);
    if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
        throw new CliError(`${projectDir} is not a directory.`);
    }
    const file = path.join(projectDir, claude ? "CLAUDE.md" : "AGENTS.md");
    const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    const eol = existing && existing.includes("\r\n") ? "\r\n" : "\n";

    if (remove) {
        if (existing === null) {
            log(`${path.basename(file)} does not exist; nothing to remove.`);
            return { file, action: "none" };
        }
        const { text, removed } = removeBlocks(existing, eol);
        if (removed === 0) {
            log(`No highimpact.js block in ${file}; nothing to remove.`);
            return { file, action: "none" };
        }
        fs.writeFileSync(file, text);
        log(`Removed the highimpact.js block from ${file}.${text.trim() === "" ? " The file is now empty; delete it if you no longer need it." : ""}`);
        return { file, action: "removed" };
    }

    const installed = findInstalledPackage(projectDir);
    const indexPath = toPosix(path.relative(projectDir, path.join(installed.dir, "ai", "index.md")));
    const next = upsertBlock(existing ?? "", managedBlock(indexPath, eol), eol);
    if (next === existing) {
        log(`${file} is already up to date (highimpact.js ${installed.version}).`);
        return { file, action: "unchanged", indexPath };
    }
    fs.writeFileSync(file, next);
    const action = existing === null ? "created" : findBlocks(existing).length ? "updated" : "appended";
    log(`${action === "created" ? "Created" : "Updated"} ${file} → ${indexPath} (highimpact.js ${installed.version}).`);
    return { file, action, indexPath };
}

function info({ log = console.log } = {}) {
    const { version } = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8"));
    log(`${PACKAGE_NAME} ${version}`);
    log(`package: ${PACKAGE_ROOT}`);
    log(`ai index: ${path.join(PACKAGE_ROOT, "ai", "index.md")}`);
    log(`docs: ${path.join(PACKAGE_ROOT, "www", "docs")}`);
    log(`api: ${path.join(PACKAGE_ROOT, "www", "api")}`);
}

function parseArgs(argv) {
    const [command, ...rest] = argv;
    const options = {};
    for (let i = 0; i < rest.length; i++) {
        const arg = rest[i];
        if (arg === "--claude") options.claude = true;
        else if (arg === "--remove") options.remove = true;
        else if (arg === "--dir") {
            if (!rest[i + 1]) throw new CliError("--dir needs a path.");
            options.dir = rest[++i];
        } else if (arg.startsWith("--dir=")) options.dir = arg.slice(6);
        else throw new CliError(`Unknown option: ${arg}\n\n${USAGE}`);
    }
    return { command, options };
}

function main(argv = process.argv.slice(2)) {
    try {
        const { command, options } = parseArgs(argv);
        if (command === "setup-ai") setupAi(options);
        else if (command === "info") info();
        else if (!command || command === "help" || command === "--help" || command === "-h") console.log(USAGE);
        else throw new CliError(`Unknown command: ${command}\n\n${USAGE}`);
    } catch (error) {
        if (!(error instanceof CliError)) throw error;
        console.error(`highimpact.js: ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { setupAi, upsertBlock, removeBlocks, findProjectRoot, findInstalledPackage, managedBlock, CliError, START, END };

if (require.main === module) main();
