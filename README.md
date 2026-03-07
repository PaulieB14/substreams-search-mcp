# Substreams Search MCP Server

[![npm version](https://img.shields.io/npm/v/substreams-search-mcp)](https://www.npmjs.com/package/substreams-search-mcp)

<a href="https://glama.ai/mcp/servers/@PaulieB14/substreams-search-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@PaulieB14/substreams-search-mcp-server/badge" />
</a>

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

## Next Step: Sink Data to PostgreSQL

Found a package with `search_substreams`? Stream it into PostgreSQL with [create-substreams-sink-sql](https://www.npmjs.com/package/create-substreams-sink-sql):

```bash
npm init substreams-sink-sql my-sink
cd my-sink
# Edit substreams.yaml with your .spkg URL, then:
make up && make setup && make dev
```

Scaffolds a complete project with Docker Postgres, pgweb UI, Makefile automation, and a step-by-step tutorial. No custom code needed.

## How it works

The substreams.dev registry has no public API. This server scrapes the package listing pages, paginates through all results, deduplicates, and returns structured JSON. Multi-word queries search for the first word server-side and filter the rest client-side.
