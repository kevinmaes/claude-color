# Claude Color

A Claude Code MCP extension for generating accessible color palettes.

Helps developers choose harmonious colors that meet APCA accessibility standards.

## Installation

```bash
# Add to Claude Code
claude mcp add claude-color -- npx claude-color
```

Or install globally:

```bash
pnpm add -g claude-color
claude mcp add claude-color -- claude-color
```

## Tools

| Tool                  | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `check_contrast`      | Validate foreground/background pairs against APCA guidelines    |
| `generate_palette`    | Generate accessible palettes from seed color, mood, or industry |
| `simulate_colorblind` | Preview colors as seen by colorblind users                      |
| `export_tokens`       | Export palettes to CSS, Tailwind, Chakra, Material, SCSS, JSON  |
| `analyze_colors`      | Scan codebases for hardcoded colors and accessibility issues    |

## Usage Examples

Ask Claude Code:

- "Generate a color palette for my fintech dashboard"
- "Check if #2563eb on white is accessible for body text"
- "Export my palette to Tailwind config"
- "How do these colors look to colorblind users?"
- "Scan my project for accessibility issues"

## Development

```bash
# Install dependencies
pnpm install

# Run in dev mode
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Lint & format
pnpm lint
pnpm format
```

## APCA Reference

| Use Case              | Minimum Lc |
| --------------------- | ---------- |
| Body text (16px)      | 75         |
| Body text (16px bold) | 60         |
| Large text (24px+)    | 60         |
| UI components         | 60         |
| Placeholder/disabled  | 45         |

## Tech Stack

- TypeScript
- MCP SDK (`@modelcontextprotocol/sdk`)
- APCA (`apca-w3`)
- Color manipulation (`colorjs.io`)

## License

MIT
