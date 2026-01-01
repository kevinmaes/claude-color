#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer(
  {
    name: 'claude-color',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: `Claude Color is a tool for generating accessible color palettes.
It helps developers choose harmonious colors that meet APCA accessibility standards.
Use these tools when users ask about colors, palettes, or accessibility.`,
  }
);

// Tool: check_contrast
// Validates color pairs against APCA guidelines
server.registerTool(
  'check_contrast',
  {
    description:
      'Check if a foreground/background color pair meets APCA accessibility standards',
    inputSchema: {
      foreground: z
        .string()
        .describe('Foreground/text color (hex, rgb, or hsl)'),
      background: z.string().describe('Background color (hex, rgb, or hsl)'),
      fontSize: z
        .number()
        .optional()
        .default(16)
        .describe('Font size in pixels'),
      fontWeight: z
        .enum(['normal', 'bold'])
        .optional()
        .default('normal')
        .describe('Font weight'),
      useCase: z
        .enum([
          'body-text',
          'large-text',
          'ui-component',
          'non-text',
          'placeholder',
          'disabled',
        ])
        .optional()
        .default('body-text')
        .describe('The intended use case for this color pair'),
    },
  },
  async (args) => {
    // TODO: Implement APCA contrast checking (issue #2)
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              status: 'not_implemented',
              message: 'APCA contrast checking will be implemented in issue #2',
              input: args,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool: generate_palette
// Generate a complete color palette from inputs
server.registerTool(
  'generate_palette',
  {
    description:
      'Generate a complete, accessible color palette based on inputs like seed color, mood, or industry',
    inputSchema: {
      seedColor: z
        .string()
        .optional()
        .describe('Starting color (hex, rgb, or hsl)'),
      harmony: z
        .enum([
          'complementary',
          'analogous',
          'triadic',
          'split-complementary',
          'tetradic',
          'monochromatic',
        ])
        .optional()
        .describe('Color harmony type'),
      mood: z
        .string()
        .optional()
        .describe(
          'Mood keywords: professional, playful, bold, minimal, warm, cool'
        ),
      industry: z
        .string()
        .optional()
        .describe('Industry: fintech, health, e-commerce, saas, gaming'),
      darkMode: z
        .boolean()
        .optional()
        .default(false)
        .describe('Generate dark mode variant'),
      existingColors: z
        .array(z.string())
        .optional()
        .describe('Existing colors to incorporate'),
    },
  },
  async (args) => {
    // TODO: Implement palette generation (issue #3)
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              status: 'not_implemented',
              message: 'Palette generation will be implemented in issue #3',
              input: args,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool: simulate_colorblind
// Show how colors appear to colorblind users
server.registerTool(
  'simulate_colorblind',
  {
    description:
      'Simulate how colors appear to users with different types of color blindness',
    inputSchema: {
      colors: z
        .array(z.string())
        .describe('Colors to simulate (hex, rgb, or hsl)'),
      type: z
        .enum([
          'protanopia',
          'deuteranopia',
          'tritanopia',
          'achromatopsia',
          'all',
        ])
        .optional()
        .default('all')
        .describe('Type of color blindness to simulate'),
    },
  },
  async (args) => {
    // TODO: Implement colorblind simulation (issue #5)
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              status: 'not_implemented',
              message: 'Colorblind simulation will be implemented in issue #5',
              input: args,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool: export_tokens
// Export palette in various formats
server.registerTool(
  'export_tokens',
  {
    description:
      'Export a color palette in various formats (CSS, Tailwind, JSON, etc.)',
    inputSchema: {
      palette: z
        .record(z.string(), z.unknown())
        .describe('Palette object to export'),
      format: z
        .enum([
          'css',
          'tailwind',
          'chakra',
          'material',
          'scss',
          'json',
          'style-dictionary',
        ])
        .describe('Export format'),
      prefix: z
        .string()
        .optional()
        .default('color')
        .describe('Variable prefix'),
      includeRgb: z
        .boolean()
        .optional()
        .default(false)
        .describe('Include RGB values for opacity support'),
    },
  },
  async (args) => {
    // TODO: Implement export (issue #6)
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              status: 'not_implemented',
              message: 'Export will be implemented in issue #6',
              input: args,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool: analyze_colors
// Analyze existing colors from a codebase or input
server.registerTool(
  'analyze_colors',
  {
    description:
      'Analyze colors from input or scan a codebase for hardcoded colors and accessibility issues',
    inputSchema: {
      colors: z
        .array(z.string())
        .optional()
        .describe('Colors to analyze directly'),
      scanPath: z
        .string()
        .optional()
        .describe('Path to scan for hardcoded colors'),
      filePatterns: z
        .array(z.string())
        .optional()
        .describe(
          'Glob patterns to scan (default: css, scss, ts, tsx, js, jsx)'
        ),
    },
  },
  async (args) => {
    // TODO: Implement analysis (issue #7)
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              status: 'not_implemented',
              message: 'Color analysis will be implemented in issue #7',
              input: args,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Claude Color MCP server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
