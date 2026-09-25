# AI usage documentation

- **Student:** Mere Cui
- **Course:** Data Visualization, Fall 2026
- **Assignment:** Visual reverse-engineering
- **AI tool:** OpenAI Codex
- **Date:** September 25, 2026

## Prompt and requested assistance

I asked Codex to complete the Visual Reverse-Engineering assignment according to the supplied requirements and to explain the purpose of the assignment. The required work included selecting a feasible existing web visualization, closely studying and recreating its visual hierarchy and data encodings with original HTML/CSS/JavaScript code, saving a screenshot and link to the original, storing all data and assets locally, adding at least two original interactions, publishing the result with GitHub Pages, and documenting the repository.

After comparing possible references, Codex helped select Our World in Data’s “Life expectancy vs. GDP per capita, 2022” because it has a public reference image, openly licensed source data, a meaningful combination of position, color, and bubble-size encodings, and an achievable level of complexity for the assignment.

## How AI assisted

Codex helped inspect the original chart’s layout, typography, colors, spacing, axes, logarithmic scale, labels, legends, and source notes. It helped write and comment the D3 code used to load the local CSV, calculate positions and bubble sizes, reproduce the static 2022 composition, and add a year slider with playback, region filters, animated transitions, keyboard-accessible bubbles, and hover tooltips. Codex also helped prepare the repository structure, README, attribution, local testing, and deployment.

After reviewing the first complete version, I rejected a generic rounded-card and gradient treatment and asked for a visual identity that felt authored rather than AI-generated. Codex helped reinterpret the surrounding interface as an architectural study sheet: a midnight drafting-grid background, warm paper canvas, monospaced project metadata, technical rules, hard-edged controls, print-like offset shadows, and clearer label halos. It also helped add a click-to-pin interaction with axis guide lines and a persistent country readout. The original chart's data encodings and composition were preserved.

I reviewed the reference, the data, and the generated files and remain responsible for the final design, source attribution, data treatment, and understanding how the code works.

## Sources

- Original visualization: https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita?time=2022
- Data and screenshot: Our World in Data, CC BY
- D3.js v7: https://d3js.org/
