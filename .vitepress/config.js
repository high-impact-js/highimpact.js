import { defineConfig } from "vitepress";

const hostname = "https://high-impact-js.github.io/highimpact.js";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    srcDir: "www",
    ignoreDeadLinks: true,
    title: "High Impact JS",
    description: "High Impact Advertising - Reimagined",
    lastUpdated: true,
    base: "/",
    publicDir: "public",
    cleanUrls: true,
    transformPageData(pageData) {
        const canonicalUrl = `${hostname}/${pageData.relativePath}`
            .replace(/index\.(md|html)$/, "")
            .replace(/\.(md|html)$/, "");

        pageData.frontmatter.head ??= [];
        pageData.frontmatter.head.push([
            "link",
            { rel: "canonical", href: canonicalUrl }
        ]);
    },
    head: [
        ["script", { src: "https://cdn.tailwindcss.com" }],
        [
            "link",
            {
                href: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
                rel: "stylesheet"
            }
        ],
        [
            "link",
            {
                rel: "apple-touch-icon",
                sizes: "180x180",
                href: "/favicons/apple-touch-icon.png"
            }
        ],
        ["link", { rel: "icon", type: "image/svg+xml", href: "/favicons/hi-favicon.svg" }],
        ["link", { rel: "manifest", href: "/favicons/site.webmanifest" }],
        [
            "meta",
            {
                name: "theme-color",
                content: "#18181b",
                media: "(prefers-color-scheme: dark)"
            }
        ],
        [
            "meta",
            {
                name: "theme-color",
                content: "#FFFFFF",
                media: "(prefers-color-scheme: light)"
            }
        ]
    ],
    sitemap: {
        hostname
    },
    markdown: {
        theme: {
            light: "github-light",
            dark: "github-dark"
        }
    },
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: {
            light: "/logo/hi-logo.svg",
            dark: "/logo/hi-logo-white.svg"
        },
        siteTitle: false,
        nav: [
            { text: "Home", link: "/" },
            { text: "About", link: "/about/index.md" },
            { text: "Docs", link: "/docs/index.md" },
            { text: "API", link: "/api/index.md" },
            { text: "Certified ✨", link: "/certified/index.md" }
        ],
        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/high-impact-js/highimpact.js"
            },
            {
                icon: "slack",
                link: "https://join.slack.com/t/get-advantage/shared_invite/zt-2gy6c4z4m-4~pIuwRfe8eqPM5H7iV9MQ"
            }
        ],
        editLink: {
            pattern:
                "https://github.com/high-impact-js/highimpact.js/edit/main/www/:path",
            text: "Edit this page on GitHub"
        },
        outline: [2, 3],
        sidebar: {
            "/about": [
                {
                    text: "About",
                    items: [
                        {
                            text: "What is High Impact JS?",
                            link: "/about/index.md"
                        },
                        {
                            text: "Why High Impact JS?",
                            link: "/about/why.md"
                        },
                        {
                            text: "How does it work?",
                            link: "/about/how.md"
                        },
                        {
                            text: "Community",
                            link: "/about/community.md"
                        },
                        {
                            text: "Contributions",
                            link: "/about/contributions.md"
                        },
                        {
                            text: "Code of Conduct",
                            link: "/about/codeofconduct.md"
                        }
                    ]
                }
            ],
            "/docs": [
                {
                    text: "Quick Start Guide",
                    items: [
                        {
                            text: "For Publisher",
                            link: "/docs/tutorial/publisher.md"
                        },
                        {
                            text: "For Creative",
                            link: "/docs/tutorial/creative.md"
                        }
                    ]
                },
                {
                    text: "Key Concepts",
                    items: [
                        {
                            text: "Formats",
                            link: "/docs/concepts/formats.md"
                        },
                        {
                            text: "Integration",
                            link: "/docs/concepts/integration.md"
                        },
                        {
                            text: "Wrapper",
                            link: "/docs/concepts/wrapper.md"
                        },
                        {
                            text: "UI Layer",
                            link: "/docs/concepts/ui-layer.md"
                        },
                        {
                            text: "Creative",
                            link: "/docs/concepts/creative.md"
                        }
                    ]
                },
                {
                    text: "Format Reference",
                    items: [
                        {
                            text: `Double Midscroll`,
                            link: "/docs/formats/double_midscroll.md"
                        },
                        {
                            text: `Double Midscroll Single Creative`,
                            link: "/docs/formats/double_midscroll_single_creative.md"
                        }
                    ]
                },
                {
                    text: "Examples",
                    items: [
                        {
                            text: `Hello World`,
                            link: "/docs/examples/hello-world.md"
                        }
                    ]
                },
                {
                    text: "Resources",
                    items: [
                        {
                            text: "AI Tools ✨",
                            link: "/docs/ai-tools.md"
                        },
                        {
                            text: "Changelog",
                            link: "/docs/changelog.md"
                        },
                        {
                            text: "Releases",
                            link: "https://github.com/high-impact-js/highimpact.js/releases"
                        }
                    ]
                },
                {
                    text: "Migration",
                    items: [
                        {
                            text: "The Merge",
                            link: "/docs/migration/index.md"
                        },
                        {
                            text: "From Advantage",
                            link: "/docs/migration/from-advantage.md"
                        },
                        {
                            text: "From High Impact JS",
                            link: "/docs/migration/from-high-impact-js.md"
                        },
                        {
                            text: "Slot API Reference",
                            link: "/docs/migration/api.md"
                        }
                    ]
                }
            ]
        }
    }
});
