# Natboa's portfolio

Website source for natboa.dev, published with GitHub Pages from the main branch.

Editorial portfolio for general junior software roles, based on the approved Editorial Studio concept. Plain HTML, CSS and JavaScript; no build step or package install required.

Update the site by editing the HTML, CSS, JavaScript, and assets, then pushing to main. GitHub Pages republishes the site automatically.

Preview locally with `python -m http.server 8767 --bind 127.0.0.1`, then open http://localhost:8767. `index.html` contains content, `styles.css` contains layout and both themes, and `app.js` handles appearance and animation preferences. Greg's section is a concise capability list beside self-hosted integration logos, with no screenshots or extra JavaScript. Logo sources are documented in assets/integrations/README.md.

The system theme is the default; explicit appearance selections persist locally. All project images are visible while scrolling, without expansion controls. The terrain GIF autoplays once its stop control is ready. Stopping replaces it with a still and saves the choice locally; playing restarts the sequence. System reduced-motion preferences always select the still and disable interface movement. Without JavaScript, the static preview and all content remain available. Project artwork and attribution are documented in assets/README.md.

Keep CNAME (`natboa.dev`) and .nojekyll when publishing. Accessibility information in English and Hebrew is linked in the footer; reports go to the repository's accessibility issue form. GitHub reports are public and require an account. No personal contact details or case studies are included.

Accessibility checks and remaining manual work are recorded in [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md). The browser check requires Playwright with Chromium and a separately obtained axe-core script:

```sh
python tests/check_accessibility.py --base-url http://localhost:8767/ --axe-script /path/to/axe.min.js
```

This checks keyboard focus, animation controls and persistence, reduced-motion changes, JavaScript-free content, bilingual reporting, themes, layout, and automated axe findings. It does not certify conformance.
