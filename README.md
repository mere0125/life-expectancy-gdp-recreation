# Life expectancy vs. GDP per capita — visual reverse-engineering

This project recreates the 2022 [Our World in Data visualization “Life expectancy vs. GDP per capita”](https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita?time=2022) with original HTML, CSS, JavaScript, and D3 code.

It was created for the Visual Reverse-Engineering assignment in *Data Visualization for Architecture, Urbanism, and the Humanities — Fall 2026*.

## What was studied and reproduced

- Serif title paired with sans-serif explanatory text
- White editorial canvas and restrained gray typography
- Logarithmic GDP-per-capita axis
- Dashed horizontal and vertical grid lines
- Bubble position encoding GDP and life expectancy
- Bubble area encoding population
- Color encoding world region
- Selected country labels
- Region and population-size legends
- Source, note, and licensing lines
- Responsive composition

## Added interactions

1. **Year exploration:** drag the 1990–2022 slider to update every country, or press Play to animate through time.
2. **Region filtering:** toggle any region on or off with the buttons above the chart.
3. **Hover and keyboard details:** hover over or focus a bubble to highlight it and see exact values in a tooltip.
4. **Pinned comparison:** click a country to keep its values visible and draw precise horizontal and vertical guide lines to both axes.

## Personal visual direction

The surrounding interface is treated as an architectural study sheet rather than a generic web dashboard. A midnight drafting-grid background, warm paper canvas, registration line, monospaced sheet metadata, hard-edged controls, and offset print-like shadows establish a visual identity separate from the reproduced OWID chart while keeping the chart itself recognizable.

## Files

- `index.html` — semantic page structure
- `styles.css` — reproduction styling and responsive layout
- `script.js` — D3 chart and interactions
- `data/life-expectancy-vs-gdp-per-capita.csv` — original downloaded Our World in Data CSV
- `assets/original-visualization.png` — screenshot of the original 2022 visualization
- `vendor/d3.v7.min.js` — local copy of D3 v7 so the project does not depend on a CDN
- `AI_USAGE.md` — documentation of AI assistance

## Run locally

Browsers restrict CSV loading when an HTML file is opened directly. Start a local server in this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

All required chart data, JavaScript, and image assets are stored locally. The project does not embed or depend on the original visualization at runtime.

## Attribution and license

Visualization reference and data: [Our World in Data](https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita?time=2022), licensed CC BY. The referenced chart credits Riley (2005); Zijdeman et al. (2015); HMD (2025); UN WPP (2024); and Bolt and van Zanden – Maddison Project Database 2023.
