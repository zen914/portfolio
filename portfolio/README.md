# Spreadsheet VA — Portfolio Website

A professional, single-page scrolling portfolio for a Spreadsheet Virtual Assistant.

## Quick Start

1. Open `index.html` in any modern browser — no build tools needed.
2. Replace placeholder text (`[Name]`, emails, links) in `index.html`.
3. Add your profile photo at `assets/images/profile.jpg`.
4. Add project screenshots in `assets/images/projects/`.
5. Place your resume PDF at `resume/resume.pdf`.
6. Optionally add a `laptop.glb` 3D model to `assets/models/`.

## File Structure

```
portfolio/
├── index.html              ← Main page
├── assets/
│   ├── css/
│   │   ├── styles.css      ← Design system & components
│   │   ├── animations.css  ← Keyframes & transitions
│   │   └── responsive.css  ← Mobile/tablet breakpoints
│   ├── js/
│   │   ├── main.js         ← Scroll effects, navbar, reveals
│   │   ├── background.js   ← Dot grid + cursor parallax
│   │   ├── laptop-3d.js    ← Three.js 3D laptop
│   │   └── contact.js      ← Form validation
│   ├── models/             ← Place laptop.glb here
│   └── images/             ← Profile & project images
├── resume/                 ← Place resume.pdf here
└── README.md
```

## Customization

- **Colors**: Edit CSS variables in `styles.css` `:root`
- **Content**: Edit text directly in `index.html`
- **Contact form**: Wire up a real API in `contact.js`

## Technologies

- HTML5, CSS3, Vanilla JavaScript
- Three.js (CDN) for 3D laptop model
- Google Fonts: DM Serif Display, DM Sans, JetBrains Mono
