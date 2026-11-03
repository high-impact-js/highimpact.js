---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Resources > AI Tools</code></p>

# AI Tools

There are two ways to give coding agents (Claude Code, Codex, Copilot, Cursor and others) knowledge of High Impact JS:

| Tool | Describes | Best for |
| :--- | :-------- | :------- |
| [Installed docs and skills](#installed-docs) | The exact version in your `node_modules` | Writing and debugging integration code |
| [MCP server](#mcp-server) | The latest code on GitHub `main` | Searching across the project and its history |

Prefer the installed docs when you implement something: the MCP server can describe APIs that are newer than the version your project uses.

## Installed docs and skills {#installed-docs}

Every npm release ships documentation for agents next to the code:

```text
node_modules/highimpact.js/
├── ai/index.md          # Start here: routes agents to the right guide and types
├── skills/              # Agent skills for publishers and creatives
├── www/docs/            # The guides on this website
├── www/api/             # API reference generated from the released source
└── dist/**/*.d.ts       # Type declarations
```

### Point your agent at the docs

Nothing is written to your project when you install the package. To opt in, run:

```sh
npm install highimpact.js
npx highimpact.js setup-ai
```

This finds your project (the nearest `package.json`), creates `AGENTS.md` if it is missing, and adds a managed block that tells agents to read `node_modules/highimpact.js/ai/index.md` first:

```markdown
<!-- highimpact.js:start -->
## highimpact.js

When integrating or debugging highimpact.js, read
node_modules/highimpact.js/ai/index.md first.
Use the installed package's documentation and type declarations
for version-specific APIs.
<!-- highimpact.js:end -->
```

The rest of the file is left as it is. Running the command again updates the block in place instead of adding a second one.

| Option | Effect |
| :----- | :----- |
| `--claude` | Write `CLAUDE.md` instead of `AGENTS.md` |
| `--remove` | Remove only the managed block |
| `--dir <path>` | Use another project directory, for example a workspace package |

The path in the block is relative to your project, so it also works when a workspace hoists `highimpact.js` to the repository root (for example `../../node_modules/highimpact.js/ai/index.md`). pnpm installs are supported. Yarn Plug'n'Play is not, because agents cannot read files inside the Yarn cache; use `nodeLinker: node-modules` or point your agent at this website instead.

Because the block points into `node_modules`, it follows your installed version automatically when you upgrade. You only need to run `setup-ai` again if you move the project or change how packages are installed.

To see which version is installed and where its docs are, run `npx highimpact.js info`.

### Install a skill for your role

Skills give agents a step-by-step workflow for one kind of task. Pick the one that matches your work:

| Skill | For |
| :---- | :-- |
| `highimpact-publisher` | Adding high-impact formats to a website: slots, wrapper, format integrations, ad servers, lifecycle events |
| `highimpact-creative` | Building ad creatives: creative messaging, format requests, scroll progress, waypoints, one-tag banners |

Install them with the [Skills CLI](https://github.com/vercel-labs/skills). Choose where the skill comes from:

::: code-group

```sh [Installed release]
# The skill shipped with the version in node_modules
npx skills add ./node_modules/highimpact.js/skills/highimpact-publisher
npx skills add ./node_modules/highimpact.js/skills/highimpact-creative
```

```sh [GitHub main]
# The latest skill from the repository
npx skills add high-impact-js/highimpact.js --skill highimpact-publisher
npx skills add high-impact-js/highimpact.js --skill highimpact-creative
```

:::

Both skills look up the installed package and read its `ai/index.md`, docs and types before writing code, so they target your version even if the skill itself came from `main`.

The Skills CLI manages its own copy of a skill. Upgrading `highimpact.js` with npm does **not** update an installed skill; run `npx skills add` again (or use the Skills CLI's update command) when you want the newer skill.

## MCP server {#mcp-server}

The **Model Context Protocol (MCP) Server** provides seamless access to Advantage documentation and codebase directly from your development environment. This powerful tool enables AI assistants to access up-to-date documentation and code examples, making development with Advantage faster and more efficient.

<div class="tip custom-block" style="padding-top: 8px">
  💡 The MCP server provides cross-repository access to always-current documentation, eliminating the need to manually search through docs or remember API details.
</div>

### What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to securely connect to external data sources and tools. For Advantage developers, this means your AI assistant can:

-   **Access live documentation** - Get real-time information from the latest docs
-   **Search code examples** - Find relevant implementation patterns instantly
-   **Understand context** - AI assistants gain deep knowledge about Advantage APIs and concepts
-   **Stay synchronized** - Always work with the most current information

### Key Benefits

#### 🔄 **Always Up-to-Date**

Unlike static documentation snapshots, the MCP server provides access to the live documentation directly from the repository. This means you'll never work with outdated information.

#### 🎯 **Contextual Assistance**

Your AI assistant understands the full context of Advantage, including:

-   Format specifications (Topscroll, Midscroll, Welcome Page, etc.)
-   Messaging protocol details
-   Integration patterns
-   Best practices and examples

#### 🚀 **Faster Development**

Get instant answers to questions like:

-   "How do I implement a custom format integration?"
-   "What are the available configuration options for the wrapper?"
-   "Show me an example of the messaging protocol in action"

#### 🔍 **Intelligent Search**

The MCP server enables semantic search across the entire Advantage ecosystem, helping you find relevant information even when you don't know the exact terms.

### Setting Up the MCP Server

#### Prerequisites

-   VS Code with GitHub Copilot or compatible AI assistant
-   Access to MCP-compatible development environment

#### Configuration

Add the Advantage MCP server to your settings:

::: code-group

```json [VS Code]
To add this MCP to VSCode, update your .vscode/mcp.json

{
  "servers": {
    "advantage Docs": {
      "type": "sse",
      "url": "https://gitmcp.io/high-impact-js/highimpact.js"
    }
  }
}
```

```json [Cursor]
To add this MCP to Cursor, update your ~/.cursor/mcp.json

{
  "mcpServers": {
    "advantage Docs": {
      "url": "https://gitmcp.io/high-impact-js/highimpact.js"
    }
  }
}
```

```json [Claude Desktop]
To add this MCP to Claude Desktop, update your claude_desktop_config.json

{
    "mcpServers": {
        "advantage Docs": {
            "type": "sse",
            "url": "https://gitmcp.io/high-impact-js/highimpact.js"
        }
    }
}
```

:::

#### Available Capabilities

Once configured, the MCP server provides:

##### 📚 **Documentation Access**

-   Complete access to all Advantage documentation
-   Format specifications and examples
-   Tutorial content for publishers and creatives
-   API reference materials

##### 🔍 **Code Search**

-   Search through the Advantage codebase
-   Find implementation examples
-   Discover usage patterns
-   Access test cases and samples

##### 💡 **Intelligent Assistance**

-   Get contextual help based on your current work
-   Receive suggestions for best practices
-   Find relevant examples for specific use cases

### Use Cases

#### For Publishers

```
"How do I configure the Advantage wrapper to exclude certain formats on mobile?"
```

The MCP server will provide current configuration options and examples from the documentation.

#### For Creatives

```
"Show me how to implement a custom format that requests TOPSCROLL"
```

Access to real code examples and the latest messaging protocol specifications.

#### For Integrators

```
"What are the available UI layer customization options?"
```

Get comprehensive information about styling and theming capabilities.

### Best Practices

#### 🎯 **Be Specific**

When asking questions, include context about what you're trying to achieve. The MCP server can provide more targeted assistance.

#### 📖 **Reference Documentation Types**

Specify if you need:

-   Tutorial information
-   API reference details
-   Code examples
-   Conceptual explanations

#### 🔄 **Stay Current**

The MCP server always provides the latest information from GitHub `main`, which can be newer than your installed version. For version-specific APIs, use the [installed docs](#installed-docs).

### Troubleshooting

#### Connection Issues

If the MCP server isn't responding:

1. Check your internet connection
2. Verify the server URL in your configuration
3. Restart your development environment

#### Outdated Responses

The MCP server provides real-time access, but if you suspect information is outdated:

1. Check the official documentation at [gethighimpact.org](https://gethighimpact.org)
2. Verify your MCP server configuration
3. Report issues in the [GitHub repository](https://github.com/high-impact-js/highimpact.js)

### Development Workflow Integration

The MCP server integrates seamlessly into your development workflow:

1. **Planning Phase** - Get architectural guidance and best practices
2. **Implementation** - Access real-time API references and examples
3. **Testing** - Find test patterns and validation approaches
4. **Documentation** - Understand integration requirements and options

### Community and Support

-   **GitHub Issues**: Report bugs or request features at [github.com/high-impact-js/highimpact.js](https://github.com/high-impact-js/highimpact.js)
-   **Slack Community**: Join discussions at [High Impact JS Slack](https://join.slack.com/t/high-impact-js/shared_invite/zt-2gy6c4z4m-4~pIuwRfe8eqPM5H7iV9MQ)
-   **Documentation**: Visit [gethighimpact.org](https://gethighimpact.org) for comprehensive guides

---

<div class="tip custom-block" style="padding-top: 8px">
  🚀 Ready to enhance your Advantage development experience? Configure the MCP server and start building with AI-powered assistance today!
</div>
