#!/usr/bin/env node
/**
 * Beautify Claude Code — MCP Image Server
 * Gives Claude Code access to royalty-free images from Unsplash, Pexels, and Picsum.
 * No more emoji suns. No more grey placeholder boxes.
 *
 * Zero-config: works immediately with Unsplash Source + Picsum (no API key needed)
 * Enhanced:    add UNSPLASH_API_KEY or PEXELS_API_KEY in env for full search
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY || null;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unsplashSourceUrl(query, width = 1600, height = 900) {
  const encoded = encodeURIComponent(query);
  return `https://source.unsplash.com/${width}x${height}/?${encoded}`;
}

function picsumUrl(width = 1600, height = 900, seed = null) {
  if (seed) return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  return `https://picsum.photos/${width}/${height}`;
}

async function searchUnsplash(query, count = 6, orientation = "landscape") {
  if (!UNSPLASH_API_KEY) return null;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_API_KEY}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.results.map((img) => ({
    url: img.urls.regular,
    full: img.urls.full,
    thumb: img.urls.thumb,
    alt: img.alt_description || query,
    credit: `Photo by ${img.user.name} on Unsplash`,
    credit_url: img.links.html,
    width: img.width,
    height: img.height,
  }));
}

async function searchPexels(query, count = 6, orientation = "landscape") {
  if (!PEXELS_API_KEY) return null;
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`;
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.photos.map((img) => ({
    url: img.src.large2x,
    full: img.src.original,
    thumb: img.src.small,
    alt: img.alt || query,
    credit: `Photo by ${img.photographer} on Pexels`,
    credit_url: img.url,
    width: img.width,
    height: img.height,
  }));
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

const COLOR_PALETTES = {
  ocean: {
    name: "Ocean",
    primary: "#0077B6",
    secondary: "#00B4D8",
    accent: "#90E0EF",
    background: "#03045E",
    surface: "#023E8A",
    text: "#CAF0F8",
    text_dark: "#03045E",
  },
  forest: {
    name: "Forest",
    primary: "#2D6A4F",
    secondary: "#40916C",
    accent: "#74C69D",
    background: "#1B4332",
    surface: "#2D6A4F",
    text: "#D8F3DC",
    text_dark: "#1B4332",
  },
  sunset: {
    name: "Sunset",
    primary: "#E85D04",
    secondary: "#F48C06",
    accent: "#FAA307",
    background: "#6A040F",
    surface: "#9D0208",
    text: "#FFBA08",
    text_dark: "#370617",
  },
  minimal: {
    name: "Minimal",
    primary: "#2B2D42",
    secondary: "#8D99AE",
    accent: "#EF233C",
    background: "#FFFFFF",
    surface: "#EDF2F4",
    text: "#2B2D42",
    text_dark: "#2B2D42",
  },
  aurora: {
    name: "Aurora",
    primary: "#7B2FBE",
    secondary: "#9B5DE5",
    accent: "#F15BB5",
    background: "#0D0221",
    surface: "#1A0533",
    text: "#FEE440",
    text_dark: "#0D0221",
  },
  earth: {
    name: "Earth",
    primary: "#7F5539",
    secondary: "#9C6644",
    accent: "#DDB892",
    background: "#EDE0D4",
    surface: "#E6CCB2",
    text: "#3F1F0A",
    text_dark: "#3F1F0A",
  },
};

// ─── Tool Handlers ────────────────────────────────────────────────────────────

async function handleSearchImages({ query, count = 6, orientation = "landscape", width = 1600, height = 900 }) {
  let results = null;

  // Try Unsplash API first (best quality search)
  if (UNSPLASH_API_KEY) {
    results = await searchUnsplash(query, count, orientation);
  }

  // Fallback to Pexels
  if (!results && PEXELS_API_KEY) {
    results = await searchPexels(query, count, orientation);
  }

  // Zero-config fallback: Unsplash Source URLs (no key, no search — keyword-based)
  if (!results) {
    results = Array.from({ length: count }, (_, i) => {
      const seed = `${query.replace(/\s+/g, "-")}-${i}`;
      return {
        url: unsplashSourceUrl(query, width, height),
        full: unsplashSourceUrl(query, 3840, 2160),
        thumb: unsplashSourceUrl(query, 400, 300),
        alt: query,
        credit: "Unsplash (royalty-free)",
        credit_url: "https://unsplash.com",
        note: "Add UNSPLASH_API_KEY or PEXELS_API_KEY for unique results per image",
      };
    });
  }

  return {
    images: results,
    usage_tip: `Use the 'url' field directly in <img src="..."> or CSS background-image. Always include alt text for accessibility.`,
    attribution_note: "Unsplash and Pexels images are free under their respective licenses. Attribution is appreciated but not required.",
  };
}

async function handleGetRandomImage({ width = 1600, height = 900, category = "", seed = null }) {
  const picsum = picsumUrl(width, height, seed || category.replace(/\s+/g, "-") || undefined);
  const unsplash = category ? unsplashSourceUrl(category, width, height) : null;

  return {
    picsum_url: picsum,
    unsplash_url: unsplash,
    recommended: unsplash || picsum,
    alt: category || "Beautiful photo",
    note: "Picsum provides consistent images per seed. Unsplash Source provides category-matched images.",
  };
}

async function handleGetColorPalette({ theme = "ocean", custom_description = "" }) {
  if (custom_description) {
    // Map description keywords to palettes
    const desc = custom_description.toLowerCase();
    if (desc.match(/ocean|sea|water|blue|marine/)) return COLOR_PALETTES.ocean;
    if (desc.match(/forest|nature|green|jungle|tree/)) return COLOR_PALETTES.forest;
    if (desc.match(/sunset|warm|fire|orange|energy/)) return COLOR_PALETTES.sunset;
    if (desc.match(/minimal|clean|modern|white|simple/)) return COLOR_PALETTES.minimal;
    if (desc.match(/purple|aurora|galaxy|space|dark/)) return COLOR_PALETTES.aurora;
    if (desc.match(/earth|brown|warm|cozy|neutral/)) return COLOR_PALETTES.earth;
  }

  const palette = COLOR_PALETTES[theme] || COLOR_PALETTES.ocean;
  return {
    palette,
    css_variables: Object.entries(palette)
      .filter(([k]) => k !== "name")
      .map(([k, v]) => `  --color-${k.replace(/_/g, "-")}: ${v};`)
      .join("\n"),
    usage: {
      hero_bg: `background-color: ${palette.background};`,
      card_bg: `background-color: ${palette.surface};`,
      button: `background-color: ${palette.primary}; color: ${palette.text};`,
      accent_text: `color: ${palette.accent};`,
      body_text: `color: ${palette.text};`,
    },
  };
}

async function handleGetFontPairings({ style = "modern" }) {
  const pairings = {
    modern: {
      heading: "Inter",
      body: "Inter",
      import: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');",
      css: "font-family: 'Inter', sans-serif;",
    },
    elegant: {
      heading: "Playfair Display",
      body: "Lato",
      import: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@400;700&display=swap');",
      css_heading: "font-family: 'Playfair Display', serif;",
      css_body: "font-family: 'Lato', sans-serif;",
    },
    tech: {
      heading: "Space Grotesk",
      body: "DM Sans",
      import: "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=DM+Sans:wght@400;500&display=swap');",
      css_heading: "font-family: 'Space Grotesk', sans-serif;",
      css_body: "font-family: 'DM Sans', sans-serif;",
    },
    minimal: {
      heading: "Syne",
      body: "Epilogue",
      import: "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Epilogue:wght@400;500&display=swap');",
      css_heading: "font-family: 'Syne', sans-serif;",
      css_body: "font-family: 'Epilogue', sans-serif;",
    },
    bold: {
      heading: "Bebas Neue",
      body: "Open Sans",
      import: "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;600&display=swap');",
      css_heading: "font-family: 'Bebas Neue', cursive;",
      css_body: "font-family: 'Open Sans', sans-serif;",
    },
  };

  return pairings[style] || pairings.modern;
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

const server = new Server(
  { name: "beautify-claude-code", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_images",
      description:
        "Search for beautiful royalty-free images from Unsplash or Pexels. Returns direct image URLs ready to embed in HTML/CSS. Use this whenever you need hero images, backgrounds, thumbnails, or any visual content in a website.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query, e.g. 'ocean sunset', 'modern office', 'healthy food'",
          },
          count: {
            type: "number",
            description: "Number of images to return (default: 6, max: 30)",
            default: 6,
          },
          orientation: {
            type: "string",
            enum: ["landscape", "portrait", "squarish"],
            description: "Image orientation (default: landscape)",
            default: "landscape",
          },
          width: {
            type: "number",
            description: "Desired image width in pixels (default: 1600)",
            default: 1600,
          },
          height: {
            type: "number",
            description: "Desired image height in pixels (default: 900)",
            default: 900,
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_random_image",
      description:
        "Get a random beautiful image, optionally filtered by category. Great for placeholder images or when you need a single image fast.",
      inputSchema: {
        type: "object",
        properties: {
          width: { type: "number", default: 1600 },
          height: { type: "number", default: 900 },
          category: {
            type: "string",
            description: "Optional category like 'nature', 'city', 'technology', 'food'",
          },
          seed: {
            type: "string",
            description: "Optional seed for consistent/reproducible image (uses Picsum)",
          },
        },
      },
    },
    {
      name: "get_color_palette",
      description:
        "Get a professional, cohesive color palette for the website. Returns hex codes, CSS variables, and usage examples.",
      inputSchema: {
        type: "object",
        properties: {
          theme: {
            type: "string",
            enum: ["ocean", "forest", "sunset", "minimal", "aurora", "earth"],
            description: "Preset theme name",
            default: "ocean",
          },
          custom_description: {
            type: "string",
            description: "Describe the vibe, e.g. 'dark and futuristic' or 'warm and cozy'",
          },
        },
      },
    },
    {
      name: "get_font_pairings",
      description:
        "Get professional Google Fonts pairings that match the website style. Returns font names, import URLs, and CSS.",
      inputSchema: {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["modern", "elegant", "tech", "minimal", "bold"],
            description: "Design style (default: modern)",
            default: "modern",
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case "search_images":
        result = await handleSearchImages(args);
        break;
      case "get_random_image":
        result = await handleGetRandomImage(args);
        break;
      case "get_color_palette":
        result = await handleGetColorPalette(args);
        break;
      case "get_font_pairings":
        result = await handleGetFontPairings(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
