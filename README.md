# Beautify Claude Code

**Stop Claude from building ugly websites.**

Claude is brilliant but has terrible taste in visuals by default — emoji suns, grey placeholder boxes, Times New Roman, and raw CSS colors. This project fixes that with two tools:

1. **MCP Server** — gives Claude Code live access to real images, palettes, and fonts during generation
2. **Skill file** — a drop-in prompt that enforces professional standards in any Claude session

---

## The Problem

Ask Claude to build a website and you might get this:

```
[☀️]  Welcome to My Site
[grey box 800x400]
[🌊] About Us
```

After installing Beautify Claude Code, you get actual hero images, professional color palettes, and Google Fonts — automatically, every time.

---

## Quick Start

### Option A — Skill File (Zero Setup, Works Immediately)

1. Copy `skill/beautify.md` to your Claude Code skills folder:

```bash
# macOS / Linux
cp skill/beautify.md ~/.claude/skills/beautify.md

# Windows
copy skill\beautify.md %APPDATA%\Claude\skills\beautify.md
```

2. In any Claude Code session, activate it:

```
/beautify build me a landing page for a meditation app
```

That's it. Claude will use real Unsplash images, professional palettes, and proper fonts automatically.

---

### Option B — MCP Server (Full Power, Live Image Search)

The MCP server connects Claude Code to Unsplash and Pexels APIs so Claude can **actively search** for the perfect image while building your site.

#### Install

```bash
cd mcp-server
npm install
```

#### Register with Claude Code

Add to your `~/.claude/claude.json` (or `%APPDATA%\Claude\claude.json` on Windows):

```json
{
  "mcpServers": {
    "beautify": {
      "command": "node",
      "args": ["/absolute/path/to/Beautify-Claude-Code/mcp-server/index.js"],
      "env": {
        "UNSPLASH_API_KEY": "your_key_here",
        "PEXELS_API_KEY": "your_key_here"
      }
    }
  }
}
```

> **API keys are optional.** Without them, the server uses Unsplash Source URLs — still real, beautiful images, just not searchable by keyword uniqueness. Get free keys at [unsplash.com/developers](https://unsplash.com/developers) and [pexels.com/api](https://www.pexels.com/api/).

#### Restart Claude Code

Claude Code will now have 4 new tools available:

| Tool | What it does |
|------|-------------|
| `search_images` | Search Unsplash/Pexels by keyword, returns embed-ready URLs |
| `get_random_image` | Get a random image, optionally by category |
| `get_color_palette` | Get a professional color palette with CSS variables |
| `get_font_pairings` | Get Google Fonts pairings with import URLs |

#### Usage

Just describe your site normally. Claude will call the tools automatically:

```
Build me a landing page for a surf school in Hawaii
```

Claude will call `search_images("surfing hawaii ocean")`, `get_color_palette("ocean")`, and `get_font_pairings("bold")` — then embed everything into production-quality HTML.

---

## What Changes

### Before

```html
<div style="background: grey; width: 100%; height: 400px;">
  <h1>☀️ Welcome to Beach Vibes</h1>
  <p>🌊 The best surf school in Hawaii</p>
</div>
```

### After

```html
<section class="hero">
  <img src="https://images.unsplash.com/photo-[...]-surfing-hawaii" alt="Surfer at sunrise in Hawaii">
  <div class="overlay"></div>
  <div class="content">
    <h1>Ride the Wave</h1>
    <p>The best surf school on the North Shore</p>
  </div>
</section>
```

---

## MCP Tools Reference

### `search_images`

```json
{
  "query": "mountain sunrise photography",
  "count": 6,
  "orientation": "landscape",
  "width": 1920,
  "height": 1080
}
```

Returns an array of image objects with `url`, `thumb`, `alt`, and attribution info.

### `get_random_image`

```json
{
  "category": "technology",
  "width": 1600,
  "height": 900,
  "seed": "hero-main"
}
```

Use `seed` for reproducible images (same seed = same photo every build).

### `get_color_palette`

```json
{
  "theme": "ocean"
}
```

Available themes: `ocean`, `forest`, `sunset`, `minimal`, `aurora`, `earth`

Returns hex codes, CSS custom properties, and per-element usage examples.

### `get_font_pairings`

```json
{
  "style": "tech"
}
```

Available styles: `modern`, `elegant`, `tech`, `minimal`, `bold`

Returns Google Fonts import URL and CSS ready to paste.

---

## Skill File Reference

The skill at `skill/beautify.md` enforces:

- Real image URLs on every `<img>` and background
- Professional color palettes defined as CSS custom properties
- Google Fonts imports
- SVG icons instead of emoji
- Modern layout patterns (full-viewport hero, card shadows, smooth scroll)
- A pre-output checklist Claude follows before returning code

---

## Contributing

PRs welcome. Ideas for contribution:

- Add more color palettes
- Add Pixabay or other free image source support
- Build a VS Code extension wrapper
- Add video background support
- Create a CLAUDE.md preset people can copy

---

## License

MIT — free to use, modify, and share.

---

*Built because life's too short for emoji-based web design.*
