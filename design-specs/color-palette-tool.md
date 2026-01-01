# Claude Color - Design Specification

A Claude Code extension that helps developers choose accessible, harmonious color palettes for their projects.

## Problem Statement

Developers (non-designers) struggle with:

- Choosing colors that work well together
- Understanding color theory principles
- Meeting accessibility requirements
- Generating consistent palettes with proper tints/shades
- Exporting colors in the right format for their stack

## Target Users

- Primary: Developers without design background
- Secondary: Designers who want quick, accessible palettes

## Architecture

### Extension Mechanism

**Primary: MCP Server**

- Provides callable tools for palette generation, contrast checking, export
- Local stdio transport during development
- HTTP transport for distribution
- Installation: `claude mcp add color-palette ...`

**Secondary: Skill**

- Teaches Claude color theory and methodology
- Auto-activates on color-related requests
- Guides the interview process
- Location: `.claude/skills/color-palette.md`

### Project Structure

```
claude-color/
├── .claude/
│   └── skills/
│       └── color-palette.md
├── src/
│   ├── index.ts                 # MCP server entry
│   ├── tools/
│   │   ├── generate-palette.ts
│   │   ├── check-contrast.ts
│   │   ├── simulate-colorblind.ts
│   │   ├── analyze-colors.ts
│   │   └── export-tokens.ts
│   └── lib/
│       ├── color-theory.ts
│       ├── apca.ts
│       ├── harmony.ts
│       └── colorblind.ts
├── design-specs/
│   └── color-palette-tool.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## MCP Tools

### 1. `generate_palette`

Generate a complete color palette from inputs.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `seed_color` | string | No | Starting color (hex, hsl, rgb) |
| `harmony` | enum | No | complementary, analogous, triadic, split-complementary, tetradic, monochromatic |
| `mood` | string | No | Keywords: professional, playful, bold, minimal, warm, cool |
| `industry` | string | No | fintech, health, e-commerce, saas, gaming, etc. |
| `dark_mode` | boolean | No | Generate dark mode variant |
| `existing_colors` | string[] | No | Colors to incorporate/match |

**Returns:**

```typescript
interface Palette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semantic: {
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };
  metadata: {
    harmony: string;
    seed: string;
    mood: string[];
  };
}

interface ColorScale {
  50: string; // Lightest tint
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string; // Darkest shade
}
```

### 2. `check_contrast`

Validate color pairs against APCA guidelines.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `foreground` | string | Yes | Text/foreground color |
| `background` | string | Yes | Background color |
| `font_size` | number | No | Font size in px (default: 16) |
| `font_weight` | enum | No | normal, bold (default: normal) |
| `use_case` | enum | No | body-text, large-text, ui-component, non-text, placeholder, disabled |

**Returns:**

```typescript
interface ContrastResult {
  lc: number; // APCA Lightness Contrast value
  passes: boolean; // Meets minimum for use case
  minimum_lc: number; // Required Lc for this use case
  recommendation: string; // Suggestion if failing
  apca_rating: 'AAA' | 'AA' | 'A' | 'fail';
}
```

**APCA Reference Thresholds:**
| Use Case | Minimum Lc |
|----------|------------|
| Body text (16px normal) | 75 |
| Body text (16px bold) | 60 |
| Large text (24px+) | 60 |
| UI components | 60 |
| Large non-text | 45 |
| Placeholder/disabled | 45 |
| Decorative only | 15 |

### 3. `simulate_colorblind`

Show how colors appear to colorblind users.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `colors` | string[] | Yes | Colors to simulate |
| `type` | enum | No | protanopia, deuteranopia, tritanopia, achromatopsia, all (default: all) |

**Returns:**

```typescript
interface ColorblindSimulation {
  original: string;
  simulations: {
    protanopia: string; // Red-blind (~1% males)
    deuteranopia: string; // Green-blind (~1% males)
    tritanopia: string; // Blue-blind (rare)
    achromatopsia: string; // Monochromat (very rare)
  };
  warnings: string[]; // e.g., "Red and green are indistinguishable in deuteranopia"
}
```

### 4. `analyze_colors`

Analyze existing colors from a codebase or input.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `colors` | string[] | No | Colors to analyze |
| `scan_path` | string | No | Path to scan for hardcoded colors |
| `file_patterns` | string[] | No | Glob patterns to scan (default: css, scss, ts, tsx, js, jsx) |

**Returns:**

```typescript
interface ColorAnalysis {
  colors_found: Array<{
    value: string;
    locations: string[]; // file:line references
    frequency: number;
  }>;
  harmony_assessment: string;
  accessibility_issues: Array<{
    pair: [string, string];
    issue: string;
    lc: number;
  }>;
  suggestions: string[];
  consolidation_opportunities: Array<{
    similar_colors: string[];
    suggested_replacement: string;
  }>;
}
```

### 5. `export_tokens`

Export palette in various formats.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `palette` | Palette | Yes | Palette object to export |
| `format` | enum | Yes | css, tailwind, chakra, material, scss, json, style-dictionary |
| `prefix` | string | No | Variable prefix (default: color) |
| `include_rgb` | boolean | No | Include RGB values for opacity support |

**Returns:**

```typescript
interface ExportResult {
  format: string;
  content: string; // The generated code/config
  filename: string; // Suggested filename
  instructions: string; // How to use in project
}
```

---

## Skill: Color Palette Guide

Location: `.claude/skills/color-palette.md`

### Purpose

Teach Claude:

- Color theory fundamentals
- APCA accessibility requirements
- Interview methodology for gathering requirements
- When to use which MCP tool
- Best practices for developer-friendly palettes

### Interview Flow

When a user asks for color help, Claude should gather:

**1. Project Context (Required)**

- Project type: web app, mobile, marketing site, dashboard, docs
- Public-facing or internal tool?
- Industry/domain

**2. Brand/Style (Required)**

- Existing brand colors? (logo, guidelines)
- Mood/emotion: professional, playful, bold, minimal, friendly, serious
- Any colors to avoid?

**3. Technical Stack (Required)**

- Framework: React, Vue, vanilla, etc.
- UI library: Tailwind, Chakra, Material, custom
- Need dark mode?
- Output format preference

**4. Accessibility (Required)**

- User demographics (elderly, general public, enterprise)
- Specific requirements (usually APCA compliance is default)

**5. Viewing Environment (Optional)**

- Primary device
- Special conditions (outdoor, low-light)

### Interview Style

- Ask ONE question at a time
- Provide sensible defaults when user is unsure
- Skip questions if answers can be inferred
- Move quickly - developers want results, not surveys

---

## APCA Compliance

This tool uses APCA (Accessible Perceptual Contrast Algorithm) instead of WCAG 2.x contrast ratios.

### Why APCA?

- More accurate perceptual model
- Accounts for font size and weight
- Polarity-aware (light-on-dark vs dark-on-light)
- Better real-world accessibility outcomes
- Will be part of WCAG 3.0

### APCA Lightness Contrast (Lc) Scale

| Lc Value | Use Cases                               |
| -------- | --------------------------------------- |
| 90+      | Preferred for body text                 |
| 75       | Minimum for body text (16px normal)     |
| 60       | Large text, bold body, UI components    |
| 45       | Large non-text, placeholders            |
| 30       | Disabled states (with other indicators) |
| 15       | Decorative, non-essential               |

### Font Size/Weight Adjustments

APCA allows lower contrast for larger/bolder text:

- 16px normal: Lc 75
- 16px bold: Lc 60
- 24px normal: Lc 60
- 32px+ bold: Lc 45

---

## Color Theory Reference

### Harmony Types

| Type                | Description                          | Use Case                            |
| ------------------- | ------------------------------------ | ----------------------------------- |
| Complementary       | Opposite on color wheel              | High contrast, bold statements      |
| Analogous           | Adjacent colors                      | Harmonious, subtle, nature-inspired |
| Triadic             | Three equidistant colors             | Vibrant, balanced, playful          |
| Split-complementary | Base + two adjacent to complement    | Contrast without tension            |
| Tetradic            | Four colors, two complementary pairs | Rich, complex (use carefully)       |
| Monochromatic       | Single hue, varied lightness         | Sophisticated, safe, cohesive       |

### 60-30-10 Rule

- 60% dominant (neutrals, backgrounds)
- 30% secondary (supporting elements)
- 10% accent (CTAs, highlights)

### Industry Color Associations

| Industry       | Common Associations                         |
| -------------- | ------------------------------------------- |
| Fintech        | Blue (trust), green (money), dark (premium) |
| Health         | Blue (trust), green (health), white (clean) |
| E-commerce     | Orange/red (urgency), blue (trust)          |
| SaaS B2B       | Blue (professional), purple (innovation)    |
| Gaming         | Bold, saturated, neon accents               |
| Sustainability | Green, earth tones, natural                 |

---

## User Workflows

### Workflow 1: New Project Palette

```
User: "I need a color palette for my new SaaS dashboard"

Claude: [Uses skill knowledge to interview]
- What's the product domain?
- Any existing brand colors?
- Mood: professional, modern, playful?
- Need dark mode?
- Using Tailwind?

Claude: [Calls generate_palette with gathered info]
Claude: [Calls check_contrast on key pairs]
Claude: [Calls export_tokens for Tailwind]
Claude: [Presents palette with preview and code]
```

### Workflow 2: Fix Accessibility Issues

```
User: "Check if my colors are accessible"

Claude: [Calls analyze_colors with scan_path]
Claude: [Identifies APCA failures]
Claude: [Suggests specific fixes]
Claude: [Offers to generate compliant alternatives]
```

### Workflow 3: Extend Existing Palette

```
User: "I have a brand blue #2563eb, build a full palette around it"

Claude: [Calls generate_palette with seed_color]
Claude: [Calls simulate_colorblind]
Claude: [Calls check_contrast on combinations]
Claude: [Exports in requested format]
```

---

## Implementation Phases

### Phase 1: Foundation

- [ ] Set up TypeScript project with MCP SDK
- [ ] Implement `check_contrast` with APCA algorithm
- [ ] Implement `generate_palette` with basic harmony
- [ ] Create initial skill document
- [ ] Local testing with Claude Code

### Phase 2: Core Features

- [ ] Implement `simulate_colorblind`
- [ ] Implement `export_tokens` (CSS, Tailwind, JSON)
- [ ] Add tint/shade generation to palettes
- [ ] Enhance skill with interview methodology

### Phase 3: Advanced

- [ ] Implement `analyze_colors` with codebase scanning
- [ ] Add more export formats (Chakra, Material, SCSS)
- [ ] Color naming system
- [ ] Dark mode palette generation

### Phase 4: Polish

- [ ] Comprehensive test suite
- [ ] Documentation
- [ ] npm package for easy installation
- [ ] Consider HTTP transport for remote use

---

## Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "apca-w3": "^0.1.9",
    "colorjs.io": "^0.5.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Key Libraries

- **apca-w3**: Official APCA contrast algorithm
- **colorjs.io**: Modern color manipulation (Color.js)

---

## Success Metrics

- Developer can go from "I need colors" to exported palette in < 2 minutes
- All generated palettes pass APCA compliance
- Colorblind simulations flag potential issues
- Export works seamlessly with common frameworks

---

## Open Questions

1. Should we support image/logo color extraction?
2. Preview generation - ASCII art? SVG? External link?
3. Palette persistence - save/load named palettes?
4. Integration with design tools (Figma plugin later)?

---

## References

- [APCA Contrast Calculator](https://www.myndex.com/APCA/)
- [APCA Documentation](https://git.apcacontrast.com/documentation/APCA_in_a_pointed_nutshell)
- [Color.js Documentation](https://colorjs.io/)
- [Claude Code MCP Documentation](https://docs.anthropic.com/en/docs/claude-code)
