# Beautify — Claude Code Skill

You are now in **Beautify Mode**. Every website you build must look stunning and professional.
Follow all rules below without exception.

---

## IMAGES — Non-Negotiable Rules

**NEVER use:**
- Emojis as visual/decorative elements (no ☀️ as a sun, no 😊 as a face, no 🌊 as waves)
- Grey placeholder boxes
- `via.placeholder.com` URLs
- Lorem ipsum with no visual context
- CSS-drawn "fake" images (e.g. a yellow circle as a sun)

**ALWAYS use real image URLs:**

### Zero-config (no API key needed)
```
Unsplash Source:  https://source.unsplash.com/{width}x{height}/?{keyword}
Picsum Photos:    https://picsum.photos/{width}/{height}
Picsum (seeded):  https://picsum.photos/seed/{seed-word}/{width}/{height}
```

### Examples
```html
<!-- Hero background -->
<img src="https://source.unsplash.com/1920x1080/?mountain,landscape" alt="Mountain landscape">

<!-- Team member photo -->
<img src="https://source.unsplash.com/400x400/?professional,portrait" alt="Team member">

<!-- Product image -->
<img src="https://source.unsplash.com/800x600/?product,minimalist" alt="Product">

<!-- Consistent image (same seed = same image every time) -->
<img src="https://picsum.photos/seed/hero-main/1920x1080" alt="Hero">
```

### If MCP server is available
Use the `search_images` tool:
```
search_images("ocean sunset", count=3, orientation="landscape")
```
Then embed the returned URLs directly.

---

## COLORS — Use Professional Palettes

**NEVER use:**
- Raw `red`, `blue`, `green` named colors for anything decorative
- Pure `#ff0000`, `#00ff00` neon colors
- Default browser styling

**ALWAYS define a CSS custom property palette at the top:**

```css
:root {
  /* Choose ONE of these palettes or create a cohesive custom one */

  /* Ocean (dark, professional) */
  --primary: #0077B6;
  --secondary: #00B4D8;
  --accent: #90E0EF;
  --bg: #03045E;
  --surface: #023E8A;
  --text: #CAF0F8;

  /* Minimal (light, clean) */
  --primary: #2B2D42;
  --secondary: #8D99AE;
  --accent: #EF233C;
  --bg: #FFFFFF;
  --surface: #EDF2F4;
  --text: #2B2D42;

  /* Aurora (dark, vibrant) */
  --primary: #7B2FBE;
  --secondary: #9B5DE5;
  --accent: #F15BB5;
  --bg: #0D0221;
  --surface: #1A0533;
  --text: #FEE440;
}
```

---

## TYPOGRAPHY — Use Google Fonts

**NEVER use:** system default fonts alone, Comic Sans, Times New Roman for modern sites.

**Import at top of CSS:**
```css
/* Modern & Clean */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

/* Elegant */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@400;700&display=swap');

/* Tech / Startup */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=DM+Sans:wght@400;500&display=swap');
```

**Always set:**
```css
body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

---

## LAYOUT — Modern Patterns Only

**Always include at least:**
- A full-viewport hero section with a real image background or gradient
- Smooth scroll: `scroll-behavior: smooth;`
- Hover transitions: `transition: all 0.3s ease;`
- Box shadows for depth: `box-shadow: 0 20px 60px rgba(0,0,0,0.3);`
- Rounded corners: `border-radius: 12px` or `24px` for cards
- Generous spacing: `padding: 80px 0` for sections

**Hero section pattern:**
```html
<section class="hero">
  <div class="hero-bg">
    <img src="https://source.unsplash.com/1920x1080/?{topic}" alt="" aria-hidden="true">
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-content">
    <h1>Your Headline</h1>
    <p>Subheadline</p>
    <a href="#" class="btn-primary">Call to Action</a>
  </div>
</section>
```

```css
.hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-bg img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(3,4,94,0.85) 0%, rgba(0,119,182,0.6) 100%);
}
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}
```

---

## ICONS — Use SVG or Icon Libraries

**NEVER use emojis as icons.**

**Use instead:**
```html
<!-- Option 1: Heroicons (inline SVG) -->
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
</svg>

<!-- Option 2: Font Awesome CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<i class="fas fa-bolt"></i>

<!-- Option 3: Phosphor Icons -->
<script src="https://unpkg.com/phosphor-icons"></script>
<ph-lightning-bolt weight="bold"></ph-lightning-bolt>
```

---

## CHECKLIST before outputting any website

Before you output the final HTML/CSS, verify:

- [ ] Every image uses a real URL (Unsplash, Picsum, or API result)
- [ ] No emojis used as visual/decorative elements
- [ ] A named color palette is defined in `:root`
- [ ] Google Fonts are imported
- [ ] Hero section has a real photo background
- [ ] Hover states exist on all interactive elements
- [ ] The page looks good at both mobile and desktop widths

---

*Beautify Mode active. Build something worth screenshotting.*
