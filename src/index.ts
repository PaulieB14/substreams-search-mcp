#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { parse } from "node-html-parser";

const REGISTRY_URL = "https://substreams.dev/packages";
const PAGE_SIZE = 24;
const MAX_PAGES = 50;

interface Package {
  name: string;
  url: string;
  creator: string;
  network: string;
  version: string;
  published: string;
  downloads: string;
}

function parseCards(html: string): Package[] {
  const root = parse(html);
  const grid = root.querySelector("#packages-grid");
  if (!grid) return [];

  const packages: Package[] = [];

  for (const link of grid.querySelectorAll("a.block")) {
    const href = link.getAttribute("href");
    if (!href) continue;

    const nameEl = link.querySelector("p.font-semibold");
    const name = nameEl?.text?.trim() || href.split("/")[2] || "";

    const creatorBtn = link.querySelector("button.user-filter-link");
    const creator = creatorBtn?.getAttribute("data-user") || creatorBtn?.text?.trim() || "";

    const networkBtn = link.querySelector("button.network-filter-link");
    const network = networkBtn?.getAttribute("data-network") || "";

    const bottom = link.querySelector("div.absolute");
    let version = "";
    let published = "";
    let downloads = "";

    if (bottom) {
      for (const row of bottom.querySelectorAll("div.flex-row")) {
        const labels = row.querySelectorAll("p");
        if (labels.length < 2) continue;
        const label = labels[0].text.trim().toLowerCase();
        const value = labels[labels.length - 1].text.trim();
        if (label.includes("version")) version = value;
        else if (label.includes("publish")) published = value;
        else if (label.includes("download")) downloads = value;
      }
    }

    packages.push({
      name,
      url: `https://substreams.dev${href}`,
      creator,
      network,
      version,
      published,
      downloads,
    });
  }

  return packages;
}

async function fetchPackages(
  query: string,
  sort: string = "most_downloaded",
  network?: string
): Promise<Package[]> {
  const words = query.trim().split(/\s+/);
  const searchTerm = words[0] || query;
  const extraWords = words.slice(1).map((w) => w.toLowerCase());

  const allPackages: Package[] = [];
  const seenUrls = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({
      search: searchTerm,
      sort,
      page: String(page),
    });
    if (network) params.set("network", network);

    const resp = await fetch(`${REGISTRY_URL}?${params}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

    const html = await resp.text();
    const pagePackages = parseCards(html);

    if (pagePackages.length === 0) break;

    for (const pkg of pagePackages) {
      if (!seenUrls.has(pkg.url)) {
        seenUrls.add(pkg.url);
        allPackages.push(pkg);
      }
    }

    if (pagePackages.length < PAGE_SIZE) break;
  }

  if (extraWords.length > 0) {
    return allPackages.filter((p) =>
      extraWords.every(
        (w) =>
          p.name.toLowerCase().includes(w) ||
          p.creator.toLowerCase().includes(w) ||
          p.network.toLowerCase().includes(w)
      )
    );
  }

  return allPackages;
}

const server = new McpServer({
  name: "substreams-search",
  version: "1.0.0",
});

server.registerTool(
  "search_substreams",
  {
    description:
      "Search the substreams.dev package registry for blockchain data stream packages. " +
      "Multi-word queries filter results to match all words.",
    inputSchema: {
      query: z
        .string()
        .describe("Search term, e.g. 'solana dex' or 'uniswap'"),
      sort: z
        .enum(["most_downloaded", "alphabetical", "most_used", "last_uploaded"])
        .optional()
        .default("most_downloaded")
        .describe("Sort order"),
      network: z
        .string()
        .optional()
        .describe(
          "Filter by blockchain network, e.g. 'ethereum', 'solana', 'arbitrum-one'"
        ),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ query, sort, network }) => {
    const packages = await fetchPackages(query, sort, network);

    const result =
      packages.length === 0
        ? { results: [], message: `No packages found for '${query}'` }
        : { results: packages, count: packages.length };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("substreams-search-mcp running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
