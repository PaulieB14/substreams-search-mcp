# Substreams Search MCP Server

MCP server that lets AI agents search the [substreams.dev](https://substreams.dev) package registry.

## Tool: `search_substreams`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string (required) | — | Search term, e.g. `"solana dex"` or `"uniswap"` |
| `sort` | string | `"most_downloaded"` | `most_downloaded`, `alphabetical`, `most_used`, `last_uploaded` |
| `network` | string | — | Filter by chain: `ethereum`, `solana`, `arbitrum-one`, etc. |

Returns JSON with package name, URL, creator, network, version, published date, and download count.

## Setup

```bash
git clone https://github.com/PaulieB14/substreams-search-mcp.git
cd substreams-search-mcp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "substreams-search": {
      "command": "/path/to/substreams-search-mcp/.venv/bin/python3",
      "args": ["/path/to/substreams-search-mcp/server.py"]
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
      "command": "/path/to/substreams-search-mcp/.venv/bin/python3",
      "args": ["/path/to/substreams-search-mcp/server.py"]
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
      "command": "/path/to/substreams-search-mcp/.venv/bin/python3",
      "args": ["/path/to/substreams-search-mcp/server.py"]
    }
  }
}
```

## How it works

The substreams.dev registry has no public API. This server scrapes the package listing pages, paginates through all results, deduplicates, and returns structured JSON. Multi-word queries search for the first word server-side and filter the rest client-side.
