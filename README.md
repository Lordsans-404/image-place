# 🖼️ ImgPlace

**ImgPlace** is a high-performance, edge-ready dynamic image generation service built with Next.js and `@vercel/og`. It allows you to generate placeholders, badges, certificates, and medals on-the-fly using simple URL parameters.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vercel OG](https://img.shields.io/badge/Vercel-OG-black?style=flat-square&logo=vercel)](https://vercel.com/docs/functions/og-image-generation)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

- 🚀 **Edge Runtime**: Lightning-fast image generation at the edge.
- 📐 **Dynamic Placeholders**: Generate custom size placeholders with any color or text.
- 🎖️ **Asset Overlays**: Overlay dynamic text and serial numbers on pre-defined assets (Badges, Trophies, Certificates).
- 🏅 **Medal System**: Specialized API for generating Gold, Silver, and Bronze medals with custom serial numbers.
- 🎨 **Fully Customizable**: Control colors, font sizes, layouts, border radius, and more via query params.
- 🌑 **Auto-Contrast**: Smart text coloring based on background brightness.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm / yarn / pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/imgplace2.git
   cd imgplace2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to start testing your endpoints.

---

## 🛠️ API Reference

### 1. Placeholder API
Generate simple placeholders by specifying dimensions.

**Endpoint:** `/[width]x[height]` or `/[size]`

| Parameter | Alias | Default | Description |
| :--- | :--- | :--- | :--- |
| `bg` | - | `e2e2e2` | Background hex color |
| `text` | `t` | `WxH` | Text to display |
| `color` | `c` | *Auto* | Text hex color (defaults to contrast with `bg`) |
| `fs` | `fontsize`| *Auto* | Font size (8px - 120px) |
| `r` | `radius` | `0` | Border radius |

**Example:**
`/[domain]/300x200?bg=6366f1&text=Hello+World&r=20`

---

### 2. Asset Overlay API
Overlay text on assets located in `public/assets/`.

**Endpoint:** `/[asset_name]` (e.g., `/badge`, `/trophy`, `/sertifikat`)

| Parameter | Alias | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | `t` | - | Text lines separated by `\|` (e.g., `Top\|Player`) |
| `color` | `c` | `ffffff` | Text hex color |
| `serial`| `s` | - | Serial number (numeric) |
| `pad` | - | `4` | Zero-padding for serial number |
| `sprefix`| - | `#` | Prefix for serial (e.g., `ID-`) |
| `layout`| - | `center` | `center`, `top`, `left`, `right` |
| `bg` | - | `transparent`| Background color |

**Example:**
`/[domain]/badge?text=MVP|2024&serial=7&c=ffd700`

---

### 3. Medal API
Specialized endpoint for medals located in `public/assets/medal/`.

**Endpoint:** `/medal/[medal_type]` (e.g., `gold`, `silver`, `bronze`)

| Parameter | Alias | Default | Description |
| :--- | :--- | :--- | :--- |
| `texty` | - | `55` | Vertical position of text (0-100%) |
| `serialy`| - | *Auto* | Vertical position of serial (0-100%) |
| `sc` | `serialcolor`| `c8a96e` | Serial number color |
| `ss` | `serialsize` | *Auto* | Serial number font size |

---

## 📂 Project Structure

```text
├── app/
│   ├── [name]/          # Placeholder & Generic Overlay Logic
│   └── medal/[name]/    # Specialized Medal Overlay Logic
├── public/
│   └── assets/          # SVG/PNG assets (badge, trophy, etc.)
│       └── medal/       # Medal-specific assets
└── next.config.mjs      # Next.js Configuration
```

---

## 🎨 Asset Guidelines

To add new assets, simply drop your `.svg` or `.png` files into `public/assets/`. You can then access them via their filename as the endpoint.

For example, adding `public/assets/star.svg` makes it available at `/[domain]/star`.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Lordsans](https://github.com/Lordsans-404)
