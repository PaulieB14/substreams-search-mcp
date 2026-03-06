# Substreams Search MCP Server

[![npm version](https://img.shields.io/npm/v/substreams-search-mcp)](https://www.npmjs.com/package/substreams-search-mcp)

MCP server that lets AI agents search the [substreams.dev](https://substreams.dev) package registry.

## Tool: `search_substreams`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string (required) | — | Search term, e.g. `"solana dex"` or `"uniswap"` |
| `sort` | string | `"most_downloaded"` | `most_downloaded`, `alphabetical`, `most_used`, `last_uploaded` |
| `network` | string | — | Filter by chain: `ethereum`, `solana`, `arbitrum-one`, etc. |

Returns JSON with package name, URL, creator, network, version, published date, and download count.

## Quick Start (npx)

No installation needed:

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "substreams-search": {
      "command": "npx",
      "args": ["substreams-search-mcp"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "substreams-search": {
      "command": "npx",
      "args": ["substreams-search-mcp"]
    }
  }
}
```

### Claude Code

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "substreams-search": {
      "command": "npx",
      "args": ["substreams-search-mcp"]
    }
  }
}
```

## How it works

The substreams.dev registry has no public API. This server scrapes the package listing pages, paginates through all results, deduplicates, and returns structured JSON. Multi-word queries search for the first word server-side and filter the rest client-side.
