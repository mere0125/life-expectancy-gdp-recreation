/*
  Visual reverse-engineering assignment by Mere Cui.
  Reference visualization and data: Our World in Data, CC BY.
  Original: https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita?time=2022
  Coding assistance: OpenAI Codex. See AI_USAGE.md for documentation.
*/

const bookIntro = document.querySelector("#book-intro");
const turnPageButton = document.querySelector("#turn-page");
const enterStudyButton = document.querySelector("#enter-study");
const skipIntroButton = document.querySelector("#skip-intro");
const chartTitle = document.querySelector("#chart-title");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function turnBookPage() {
  if (bookIntro.classList.contains("is-open")) return;

  bookIntro.classList.add("is-open");
  turnPageButton.disabled = true;
  enterStudyButton.disabled = false;
  window.setTimeout(function() {
    enterStudyButton.focus();
  }, reduceMotion.matches ? 20 : 1080);
}

function closeBookIntro() {
  bookIntro.classList.add("is-leaving");
  document.body.classList.remove("book-locked");
  window.setTimeout(function() {
    bookIntro.hidden = true;
    chartTitle.focus();
  }, reduceMotion.matches ? 20 : 520);
}

turnPageButton.addEventListener("click", turnBookPage);
enterStudyButton.addEventListener("click", closeBookIntro);
skipIntroButton.addEventListener("click", closeBookIntro);

document.addEventListener("keydown", function(event) {
  if (bookIntro.hidden || bookIntro.classList.contains("is-leaving")) return;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    if (bookIntro.classList.contains("is-open")) {
      closeBookIntro();
    } else {
      turnBookPage();
    }
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeBookIntro();
  }
});

window.requestAnimationFrame(function() {
  turnPageButton.focus();
});

const chartWidth = 850;
const chartHeight = 470;
const margin = { top: 42, right: 150, bottom: 58, left: 55 };
const plotRight = chartWidth - margin.right;
const plotBottom = chartHeight - margin.bottom;

const regionColors = new Map([
  ["North America", "#e78373"],
  ["South America", "#c8a77d"],
  ["Africa", "#ad62a7"],
  ["Europe", "#6f7ca8"],
  ["Asia", "#269a94"],
  ["Oceania", "#61b9bb"]
]);

const labelOffsets = new Map([
  ["China", [8, -11]],
  ["India", [8, -10]],
  ["United States", [8, -8]],
  ["Japan", [8, -8]],
  ["Russia", [8, -8]],
  ["Indonesia", [8, -7]],
  ["Pakistan", [8, 15]],
  ["Nigeria", [0, -10]],
  ["Ethiopia", [8, -7]],
  ["South Africa", [8, 15]],
  ["North Korea", [0, -9]],
  ["Palestine", [0, -8]],
  ["Malawi", [-4, -9]],
  ["Democratic Republic of Congo", [-7, 15]],
  ["Mali", [-5, 14]],
  ["Chad", [-5, 16]],
  ["Lesotho", [7, 15]],
  ["Cameroon", [-4, 15]],
  ["Angola", [7, 15]],
  ["Algeria", [7, -8]],
  ["Equatorial Guinea", [8, 15]],
  ["Central African Republic", [0, -8]]
]);

const svg = d3.select("#bubble-chart");
const tooltip = d3.select("#tooltip");
const slider = document.querySelector("#year-slider");
const yearOutput = document.querySelector("#year-output");
const titleYear = document.querySelector("#title-year");
const playButton = document.querySelector("#play-button");
const playLabel = document.querySelector(".play-label");
const playIcon = document.querySelector(".play-icon");
const selectionReadout = document.querySelector("#selection-readout .readout-message");

let currentYear = 2022;
let activeRegions = new Set(regionColors.keys());
let rowsByYear = new Map();
let playTimer = null;
let selectedCode = null;

const xScale = d3.scaleLog()
  .domain([500, 160000])
  .range([margin.left, plotRight]);

const yScale = d3.scaleLinear()
  .domain([18, 85])
  .range([plotBottom, margin.top]);

const radiusScale = d3.scaleSqrt()
  .domain([0, 1_450_000_000])
  .range([2, 24]);

svg.append("defs")
  .append("clipPath")
  .attr("id", "plot-clip")
  .append("rect")
  .attr("x", margin.left)
  .attr("y", margin.top)
  .attr("width", plotRight - margin.left)
  .attr("height", plotBottom - margin.top);

const plot = svg.append("g").attr("class", "plot");
const selectionLayer = svg.append("g").attr("class", "selection-layer");
const bubbleLayer = svg.append("g")
  .attr("class", "bubble-layer")
  .attr("clip-path", "url(#plot-clip)");
const labelLayer = svg.append("g").attr("class", "label-layer");

drawScaffolding();
buildRegionFilters();

d3.csv("data/life-expectancy-vs-gdp-per-capita.csv").then(function(rawData) {
  const cleanData = rawData.map(function(d) {
    return {
      entity: d.Entity,
      code: d.Code,
      year: +d.Year,
      lifeExpectancy: +d["Life expectancy at birth"],
      gdpPerCapita: +d["GDP per capita"],
      population: +d.Population,
      region: d["World region according to OWID"]
    };
  }).filter(function(d) {
    return d.code &&
      d.year >= 1990 &&
      d.year <= 2022 &&
      Number.isFinite(d.lifeExpectancy) && d.lifeExpectancy > 0 &&
      Number.isFinite(d.gdpPerCapita) && d.gdpPerCapita > 0 &&
      Number.isFinite(d.population) && d.population > 0 &&
      regionColors.has(d.region);
  });

  rowsByYear = d3.group(cleanData, function(d) { return d.year; });
  updateChart(false);
}).catch(function(error) {
  console.error("Unable to load the local CSV data:", error);
});

slider.addEventListener("input", function(event) {
  stopPlayback();
  currentYear = +event.target.value;
  updateChart(true);
});

playButton.addEventListener("click", function() {
  if (playTimer) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

function drawScaffolding() {
  const xTicks = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const yTicks = [20, 30, 40, 50, 60, 70, 80];

  svg.append("text")
    .attr("class", "plot-label")
    .attr("x", 0)
    .attr("y", 18)
    .text("Life expectancy at birth");

  plot.append("g")
    .attr("class", "grid x-grid")
    .attr("transform", `translate(0,${plotBottom})`)
    .call(d3.axisBottom(xScale)
      .tickValues(xTicks)
      .tickSize(-(plotBottom - margin.top))
      .tickFormat(""));

  plot.append("g")
    .attr("class", "grid y-grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale)
      .tickValues(yTicks)
      .tickSize(-(plotRight - margin.left))
      .tickFormat(""));

  plot.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${plotBottom})`)
    .call(d3.axisBottom(xScale)
      .tickValues(xTicks)
      .tickFormat(function(d) { return "$" + d3.format(",")(d); })
      .tickSize(0)
      .tickPadding(9));

  plot.append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale)
      .tickValues(yTicks)
      .tickFormat(function(d) { return d + " years"; })
      .tickSize(0)
      .tickPadding(7));

  svg.append("text")
    .attr("class", "axis-title")
    .attr("x", (margin.left + plotRight) / 2)
    .attr("y", chartHeight - 7)
    .attr("text-anchor", "middle")
    .html("GDP per capita ")
    .append("tspan")
    .attr("font-weight", 400)
    .text("(international-$ in 2011 prices; plotted on a logarithmic axis)");

  drawLegend();
}

function drawLegend() {
  const legend = svg.append("g")
    .attr("class", "chart-legend")
    .attr("transform", `translate(${plotRight + 20},${margin.top + 6})`);

  Array.from(regionColors.entries()).forEach(function([region, color], index) {
    const row = legend.append("g")
      .attr("transform", `translate(0,${index * 20})`);

    row.append("rect")
      .attr("width", 9)
      .attr("height", 9)
      .attr("y", -8)
      .attr("fill", color);

    row.append("text")
      .attr("class", "legend-label")
      .attr("x", 14)
      .text(region);
  });

  legend.append("line")
    .attr("x1", 0)
    .attr("x2", 115)
    .attr("y1", 127)
    .attr("y2", 127)
    .attr("stroke", "#dddddd");

  const sizeLegend = legend.append("g")
    .attr("transform", "translate(55,171)");

  const largeRadius = radiusScale(1_400_000_000);
  const smallRadius = radiusScale(600_000_000);

  sizeLegend.append("circle")
    .attr("r", largeRadius)
    .attr("fill", "none")
    .attr("stroke", "#aaaaaa");

  sizeLegend.append("circle")
    .attr("cy", largeRadius - smallRadius)
    .attr("r", smallRadius)
    .attr("fill", "none")
    .attr("stroke", "#aaaaaa");

  sizeLegend.append("text")
    .attr("class", "size-note")
    .attr("y", -largeRadius - 7)
    .text("1.4B");

  sizeLegend.append("text")
    .attr("class", "size-note")
    .attr("y", largeRadius - smallRadius + 4)
    .text("600M");

  sizeLegend.append("text")
    .attr("class", "size-note")
    .attr("y", largeRadius + 29)
    .text("Circles sized by");

  sizeLegend.append("text")
    .attr("class", "size-note")
    .attr("y", largeRadius + 44)
    .text("Population");
}

function buildRegionFilters() {
  const container = d3.select("#region-filters");

  container.selectAll("button")
    .data(Array.from(regionColors.entries()))
    .join("button")
    .attr("type", "button")
    .attr("class", "region-button")
    .attr("aria-pressed", "true")
    .style("--region-color", function(d) { return d[1]; })
    .text(function(d) { return d[0]; })
    .on("click", function(event, d) {
      const region = d[0];

      if (activeRegions.has(region)) {
        activeRegions.delete(region);
      } else {
        activeRegions.add(region);
      }

      d3.select(this).attr("aria-pressed", activeRegions.has(region));
      updateChart(true);
    });
}

function updateChart(animate) {
  if (!rowsByYear.size) return;

  const yearData = (rowsByYear.get(currentYear) || []).filter(function(d) {
    return activeRegions.has(d.region);
  });

  slider.value = currentYear;
  yearOutput.value = currentYear;
  titleYear.textContent = currentYear;

  const duration = animate ? 420 : 0;
  const transition = svg.transition().duration(duration).ease(d3.easeCubicOut);

  const bubbles = bubbleLayer.selectAll("circle")
    .data(yearData, function(d) { return d.code; });

  bubbles.exit()
    .transition(transition)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  const bubblesEnter = bubbles.enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("tabindex", 0)
    .attr("cx", function(d) { return xScale(d.gdpPerCapita); })
    .attr("cy", function(d) { return yScale(d.lifeExpectancy); })
    .attr("r", 0)
    .attr("fill", function(d) { return regionColors.get(d.region); })
    .style("opacity", 0.88)
    .on("mouseenter focus", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave blur", hideTooltip)
    .on("click", function(event, d) {
      event.stopPropagation();

      if (selectedCode === d.code) {
        clearSelection();
      } else {
        pinCountry(d);
      }
    });

  bubblesEnter.merge(bubbles)
    .attr("aria-label", function(d) {
      return `${d.entity}: life expectancy ${d.lifeExpectancy.toFixed(1)} years, GDP per capita ${formatCurrency(d.gdpPerCapita)}, population ${formatPopulation(d.population)}`;
    })
    .transition(transition)
    .attr("cx", function(d) { return xScale(d.gdpPerCapita); })
    .attr("cy", function(d) { return yScale(d.lifeExpectancy); })
    .attr("r", function(d) { return radiusScale(d.population); })
    .attr("fill", function(d) { return regionColors.get(d.region); })
    .style("opacity", 0.88);

  bubbleLayer.selectAll("circle")
    .classed("is-selected", function(d) { return d.code === selectedCode; });

  const labelData = yearData.filter(function(d) {
    return labelOffsets.has(d.entity);
  });

  const labels = labelLayer.selectAll("text")
    .data(labelData, function(d) { return d.code; });

  labels.exit().remove();

  labels.enter()
    .append("text")
    .attr("class", "country-label")
    .merge(labels)
    .text(function(d) {
      return d.entity === "Democratic Republic of Congo" ? "DR Congo" : d.entity;
    })
    .attr("fill", function(d) { return regionColors.get(d.region); })
    .attr("text-anchor", function(d) {
      return labelOffsets.get(d.entity)[0] < 0 ? "end" : "start";
    })
    .transition(transition)
    .attr("x", function(d) {
      return xScale(d.gdpPerCapita) + labelOffsets.get(d.entity)[0];
    })
    .attr("y", function(d) {
      return yScale(d.lifeExpectancy) + labelOffsets.get(d.entity)[1];
    });

  updatePinnedSelection(yearData);
}

function pinCountry(d) {
  selectedCode = d.code;
  bubbleLayer.selectAll("circle")
    .classed("is-selected", function(other) { return other.code === selectedCode; });
  drawSelectionGuides(d);
  updateSelectionReadout(d);
}

function updatePinnedSelection(yearData) {
  if (!selectedCode) return;

  const selectedDatum = yearData.find(function(d) {
    return d.code === selectedCode;
  });

  if (selectedDatum) {
    drawSelectionGuides(selectedDatum);
    updateSelectionReadout(selectedDatum);
  } else {
    clearSelection();
  }
}

function drawSelectionGuides(d) {
  const x = xScale(d.gdpPerCapita);
  const y = yScale(d.lifeExpectancy);

  selectionLayer.selectAll("line")
    .data([
      { x1: margin.left, y1: y, x2: x, y2: y },
      { x1: x, y1: y, x2: x, y2: plotBottom }
    ])
    .join("line")
    .attr("class", "selection-guide")
    .attr("x1", function(line) { return line.x1; })
    .attr("y1", function(line) { return line.y1; })
    .attr("x2", function(line) { return line.x2; })
    .attr("y2", function(line) { return line.y2; });
}

function updateSelectionReadout(d) {
  selectionReadout.innerHTML =
    `<strong>${d.entity}</strong> / ${d.year} / ` +
    `LIFE ${d.lifeExpectancy.toFixed(1)} YRS / ` +
    `GDP ${formatCurrency(d.gdpPerCapita)} / ` +
    `POP ${formatPopulation(d.population).toUpperCase()}`;
}

function clearSelection() {
  selectedCode = null;
  selectionLayer.selectAll("line").remove();
  bubbleLayer.selectAll("circle").classed("is-selected", false);
  selectionReadout.textContent = "Click a country to pin its position and values.";
}

function showTooltip(event, d) {
  bubbleLayer.selectAll("circle")
    .style("opacity", function(other) {
      return other.code === d.code ? 1 : 0.28;
    });

  tooltip
    .classed("visible", true)
    .html(
      `<strong>${d.entity}</strong>` +
      `Life expectancy: ${d.lifeExpectancy.toFixed(1)} years<br>` +
      `GDP per capita: ${formatCurrency(d.gdpPerCapita)}<br>` +
      `Population: ${formatPopulation(d.population)}<br>` +
      `Region: ${d.region}`
    );

  moveTooltip(event);
}

function moveTooltip(event) {
  if (!event.clientX && event.type === "focus") {
    tooltip.style("left", "24px").style("top", "24px");
    return;
  }

  tooltip
    .style("left", event.clientX + "px")
    .style("top", event.clientY + "px");
}

function hideTooltip() {
  bubbleLayer.selectAll("circle").style("opacity", 0.88);
  tooltip.classed("visible", false);
}

function startPlayback() {
  if (currentYear >= 2022) currentYear = 1990;

  playLabel.textContent = "Pause";
  playIcon.textContent = "❚❚";
  playButton.setAttribute("aria-label", "Pause years");
  updateChart(true);

  playTimer = window.setInterval(function() {
    currentYear += 1;

    if (currentYear > 2022) {
      stopPlayback();
      return;
    }

    updateChart(true);
  }, 650);
}

function stopPlayback() {
  if (playTimer) window.clearInterval(playTimer);
  playTimer = null;
  playLabel.textContent = "Play";
  playIcon.textContent = "▶";
  playButton.setAttribute("aria-label", "Play years");
}

function formatCurrency(value) {
  return "$" + d3.format(",.0f")(value);
}

function formatPopulation(value) {
  if (value >= 1_000_000_000) return d3.format(".2~f")(value / 1_000_000_000) + " billion";
  if (value >= 1_000_000) return d3.format(".3~f")(value / 1_000_000) + " million";
  return d3.format(",")(value);
}
