import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ZOOM_STEP = 1.35;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const useChart = (draw, dependencies) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    return draw(ref.current);
  }, dependencies);

  return ref;
};

const chartFrame = (node, { width = 720, height = 320, margin, ariaLabel }) => {
  const svg = d3
    .select(node)
    .html("")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", ariaLabel);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { g, innerWidth, innerHeight };
};

const formatTransformValue = (value) => Number(value.toFixed(3)).toString();

const setZoomAttributes = (node, transform) => {
  node.dataset.zoomScale = formatTransformValue(transform.k);
  node.dataset.zoomX = formatTransformValue(transform.x);
  node.dataset.zoomY = formatTransformValue(transform.y);
};

const createInteractiveChart = (node, config, renderContent) => {
  const shell = d3.select(node).html("").attr("data-zoom-scale", "1");
  shell.attr("data-zoom-x", "0").attr("data-zoom-y", "0");

  const svg = shell
    .append("svg")
    .attr("viewBox", `0 0 ${config.width} ${config.height}`)
    .attr("role", "img")
    .attr("aria-label", config.ariaLabel);

  const innerWidth = config.width - config.margin.left - config.margin.right;
  const innerHeight = config.height - config.margin.top - config.margin.bottom;
  const defs = svg.append("defs");
  const clipId = `chart-clip-${Math.random().toString(36).slice(2, 10)}`;

  defs
    .append("clipPath")
    .attr("id", clipId)
    .append("rect")
    .attr("width", innerWidth)
    .attr("height", innerHeight);

  const root = svg
    .append("g")
    .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
  const axesLayer = root.append("g").attr("class", "chart-axes");
  const viewport = root.append("g").attr("clip-path", `url(#${clipId})`);
  const contentLayer = viewport.append("g").attr("class", "chart-content");
  const interactionLayer = root
    .append("rect")
    .attr("class", "chart-interaction-layer")
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .attr("fill", "transparent")
    .style("cursor", "grab");

  const zoom = d3
    .zoom()
    .scaleExtent([MIN_ZOOM, MAX_ZOOM])
    .translateExtent([
      [0, 0],
      [innerWidth, innerHeight],
    ])
    .extent([
      [0, 0],
      [innerWidth, innerHeight],
    ])
    .on("start", () => {
      interactionLayer.style("cursor", "grabbing");
    })
    .on("zoom", (event) => {
      contentLayer.attr("transform", event.transform.toString());
      setZoomAttributes(node, event.transform);
    })
    .on("end", () => {
      interactionLayer.style("cursor", "grab");
    });

  interactionLayer.call(zoom);

  renderContent({
    axesLayer,
    contentLayer,
    innerWidth,
    innerHeight,
  });

  const setTransform = (transform) => {
    interactionLayer.call(zoom.transform, transform);
  };

  setTransform(d3.zoomIdentity);

  return {
    zoomIn: () =>
      interactionLayer.transition().duration(180).call(zoom.scaleBy, ZOOM_STEP),
    zoomOut: () =>
      interactionLayer.transition().duration(180).call(zoom.scaleBy, 1 / ZOOM_STEP),
    reset: () =>
      interactionLayer.transition().duration(180).call(zoom.transform, d3.zoomIdentity),
  };
};

export const chartTestUtils = {
  chartFrame,
  createInteractiveChart,
  formatTransformValue,
};

const ChartSurface = ({ draw, dependencies, labels }) => {
  const shellRef = useRef(null);
  const controlsRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!shellRef.current) return undefined;

    const controls = draw(shellRef.current);
    controlsRef.current = controls;
    setIsReady(true);

    return () => {
      controlsRef.current = null;
      setIsReady(false);
    };
  }, dependencies);

  return (
    <div className="chart-frame">
      <div className="chart-toolbar">
        <p>{labels.interactionHint}</p>
        <div className="chart-toolbar__buttons">
          <button
            type="button"
            disabled={!isReady}
            onClick={() => controlsRef.current?.zoomOut()}
          >
            {labels.zoomOut}
          </button>
          <button
            type="button"
            disabled={!isReady}
            onClick={() => controlsRef.current?.zoomIn()}
          >
            {labels.zoomIn}
          </button>
          <button
            type="button"
            disabled={!isReady}
            onClick={() => controlsRef.current?.reset()}
          >
            {labels.resetZoom}
          </button>
        </div>
      </div>
      <div className="chart-shell" ref={shellRef} />
    </div>
  );
};

const baseChartProps = (width, height, margin, ariaLabel) => ({
  width,
  height,
  margin,
  ariaLabel,
});

export function PerformanceTrendChart({ data, labels, formatters }) {
  return (
    <ChartSurface
      labels={labels}
      dependencies={[data, formatters, labels]}
      draw={(node) =>
        createInteractiveChart(
          node,
          baseChartProps(780, 330, { top: 24, right: 64, bottom: 36, left: 56 }, labels.ariaLabel),
          ({ axesLayer, contentLayer, innerWidth, innerHeight }) => {
            const x = d3.scaleLinear().domain(d3.extent(data, (item) => item.episode)).range([0, innerWidth]);
            const y = d3.scaleLinear().domain([0, d3.max(data, (item) => item.downloads)]).nice().range([innerHeight, 0]);
            const yRight = d3
              .scaleLinear()
              .domain([0, d3.max(data, (item) => item.completionNumbers)])
              .nice()
              .range([innerHeight, 0]);

            axesLayer.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
            axesLayer.append("g").call(d3.axisLeft(y).ticks(6).tickFormat((value) => formatters.compact(value)));
            axesLayer
              .append("g")
              .attr("transform", `translate(${innerWidth},0)`)
              .call(d3.axisRight(yRight).ticks(6).tickFormat((value) => formatters.compact(value)));

            contentLayer
              .append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "#ff6b3d")
              .attr("stroke-width", 3)
              .attr("d", d3.line().x((item) => x(item.episode)).y((item) => y(item.downloads)).curve(d3.curveMonotoneX));

            contentLayer
              .append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "#2dd4bf")
              .attr("stroke-width", 3)
              .attr("stroke-dasharray", "6 5")
              .attr("d", d3.line().x((item) => x(item.episode)).y((item) => yRight(item.completionNumbers)).curve(d3.curveMonotoneX));

            const legend = axesLayer.append("g").attr("transform", "translate(8, 0)");
            [
              { color: "#ff6b3d", label: labels.downloadsLegend },
              { color: "#2dd4bf", label: labels.completedLegend },
            ].forEach((item, index) => {
              const row = legend.append("g").attr("transform", `translate(${index * 170}, -8)`);
              row.append("line").attr("x1", 0).attr("x2", 26).attr("y1", 0).attr("y2", 0).attr("stroke", item.color).attr("stroke-width", 3);
              row.append("text").attr("x", 34).attr("y", 4).text(item.label);
            });
          },
        )
      }
    />
  );
}

export function RetentionScatterChart({ data, colors, labels, formatters }) {
  return (
    <ChartSurface
      labels={labels}
      dependencies={[colors, data, formatters, labels]}
      draw={(node) =>
        createInteractiveChart(
          node,
          baseChartProps(780, 330, { top: 18, right: 20, bottom: 44, left: 56 }, labels.ariaLabel),
          ({ axesLayer, contentLayer, innerWidth, innerHeight }) => {
            const x = d3.scaleLinear().domain(d3.extent(data, (item) => item.durationMinutes)).nice().range([0, innerWidth]);
            const y = d3.scaleLinear().domain([0.45, d3.max(data, (item) => item.completionRate)]).nice().range([innerHeight, 0]);
            const r = d3.scaleSqrt().domain(d3.extent(data, (item) => item.downloads)).range([4, 16]);

            axesLayer.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(8).tickFormat((value) => formatters.number(value)));
            axesLayer.append("g").call(d3.axisLeft(y).ticks(6).tickFormat((value) => formatters.percent(value)));

            contentLayer
              .append("g")
              .selectAll("circle")
              .data(data)
              .join("circle")
              .attr("cx", (item) => x(item.durationMinutes))
              .attr("cy", (item) => y(item.completionRate))
              .attr("r", (item) => r(item.downloads))
              .attr("fill", (item) => colors(item.topic))
              .attr("fill-opacity", 0.78)
              .attr("stroke", "#08111f")
              .append("title")
              .text((item) => `${labels.episodePrefix} ${item.episode}: ${item.title}`);

            axesLayer.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 38).attr("text-anchor", "middle").text(labels.durationAxis);
            axesLayer.append("text").attr("transform", "rotate(-90)").attr("x", -innerHeight / 2).attr("y", -40).attr("text-anchor", "middle").text(labels.completionAxis);
          },
        )
      }
    />
  );
}

export function AudienceMixChart({ data, labels, formatters }) {
  return (
    <ChartSurface
      labels={labels}
      dependencies={[data, formatters, labels]}
      draw={(node) =>
        createInteractiveChart(
          node,
          baseChartProps(780, 330, { top: 18, right: 20, bottom: 42, left: 56 }, labels.ariaLabel),
          ({ axesLayer, contentLayer, innerWidth, innerHeight }) => {
            const trimmed = data.slice(-12);
            const stack = d3.stack().keys(["newListeners", "returningListeners"])(trimmed);
            const x = d3.scaleBand().domain(trimmed.map((item) => item.episode)).range([0, innerWidth]).padding(0.22);
            const y = d3
              .scaleLinear()
              .domain([0, d3.max(trimmed, (item) => item.newListeners + item.returningListeners)])
              .nice()
              .range([innerHeight, 0]);

            axesLayer.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
            axesLayer.append("g").call(d3.axisLeft(y).ticks(6).tickFormat((value) => formatters.compact(value)));

            contentLayer
              .append("g")
              .selectAll("g")
              .data(stack)
              .join("g")
              .attr("fill", (item) => (item.key === "newListeners" ? "#ffd166" : "#118ab2"))
              .selectAll("rect")
              .data((item) => item)
              .join("rect")
              .attr("x", (item) => x(item.data.episode))
              .attr("y", (item) => y(item[1]))
              .attr("height", (item) => y(item[0]) - y(item[1]))
              .attr("width", x.bandwidth());
          },
        )
      }
    />
  );
}

export function TopicBarChart({ data, colors, labels, formatters, getTopicLabel }) {
  return (
    <ChartSurface
      labels={labels}
      dependencies={[colors, data, formatters, getTopicLabel, labels]}
      draw={(node) =>
        createInteractiveChart(
          node,
          baseChartProps(780, 330, { top: 18, right: 20, bottom: 36, left: 160 }, labels.ariaLabel),
          ({ axesLayer, contentLayer, innerWidth, innerHeight }) => {
            const x = d3.scaleLinear().domain([0, d3.max(data, (item) => item.avgDownloads)]).nice().range([0, innerWidth]);
            const y = d3.scaleBand().domain(data.map((item) => item.topic)).range([0, innerHeight]).padding(0.22);

            axesLayer.append("g").call(d3.axisLeft(y).tickFormat((topic) => getTopicLabel(topic)));
            axesLayer.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(6).tickFormat((value) => formatters.compact(value)));

            contentLayer
              .selectAll("rect")
              .data(data)
              .join("rect")
              .attr("x", 0)
              .attr("y", (item) => y(item.topic))
              .attr("width", (item) => x(item.avgDownloads))
              .attr("height", y.bandwidth())
              .attr("rx", 10)
              .attr("fill", (item) => colors(item.topic));

            contentLayer
              .selectAll(".label")
              .data(data)
              .join("text")
              .attr("class", "label")
              .attr("x", (item) => x(item.avgDownloads) + 8)
              .attr("y", (item) => y(item.topic) + y.bandwidth() / 2 + 4)
              .text((item) => formatters.number(Math.round(item.avgDownloads)));
          },
        )
      }
    />
  );
}

export function ConversionBubbleChart({ data, colors, labels, formatters }) {
  return (
    <ChartSurface
      labels={labels}
      dependencies={[colors, data, formatters, labels]}
      draw={(node) =>
        createInteractiveChart(
          node,
          baseChartProps(780, 330, { top: 18, right: 20, bottom: 44, left: 56 }, labels.ariaLabel),
          ({ axesLayer, contentLayer, innerWidth, innerHeight }) => {
            const x = d3.scaleLinear().domain([0, d3.max(data, (item) => item.socialShares)]).nice().range([0, innerWidth]);
            const y = d3.scaleLinear().domain([0, d3.max(data, (item) => item.subscribersGained)]).nice().range([innerHeight, 0]);
            const r = d3.scaleSqrt().domain(d3.extent(data, (item) => item.downloads)).range([4, 18]);

            axesLayer.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(6).tickFormat((value) => formatters.compact(value)));
            axesLayer.append("g").call(d3.axisLeft(y).ticks(6).tickFormat((value) => formatters.compact(value)));

            contentLayer
              .selectAll("circle")
              .data(data)
              .join("circle")
              .attr("cx", (item) => x(item.socialShares))
              .attr("cy", (item) => y(item.subscribersGained))
              .attr("r", (item) => r(item.downloads))
              .attr("fill", (item) => colors(item.topic))
              .attr("fill-opacity", 0.75)
              .attr("stroke", "#08111f")
              .append("title")
              .text((item) => `${labels.episodePrefix} ${item.episode}: ${item.title}`);
          },
        )
      }
    />
  );
}

export function ConversionRankingChart({ data, labels, formatters }) {
  return (
    <ChartSurface
      labels={labels}
      dependencies={[data, formatters, labels]}
      draw={(node) =>
        createInteractiveChart(
          node,
          baseChartProps(780, 360, { top: 18, right: 30, bottom: 36, left: 220 }, labels.ariaLabel),
          ({ axesLayer, contentLayer, innerWidth, innerHeight }) => {
            const top = [...data]
              .sort((left, right) => d3.descending(left.subscriberConversion, right.subscriberConversion))
              .slice(0, 12)
              .sort((left, right) => d3.ascending(left.subscriberConversion, right.subscriberConversion));
            const x = d3.scaleLinear().domain([0, d3.max(top, (item) => item.subscriberConversion)]).nice().range([0, innerWidth]);
            const y = d3.scaleBand().domain(top.map((item) => `${labels.episodePrefix} ${item.episode}`)).range([innerHeight, 0]).padding(0.4);

            axesLayer.append("g").call(d3.axisLeft(y));
            axesLayer.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(6).tickFormat((value) => formatters.percent(value)));

            contentLayer
              .selectAll("line.rank")
              .data(top)
              .join("line")
              .attr("class", "rank")
              .attr("x1", 0)
              .attr("x2", (item) => x(item.subscriberConversion))
              .attr("y1", (item) => y(`${labels.episodePrefix} ${item.episode}`) + y.bandwidth() / 2)
              .attr("y2", (item) => y(`${labels.episodePrefix} ${item.episode}`) + y.bandwidth() / 2)
              .attr("stroke", "#6c8cff")
              .attr("stroke-width", 3);

            contentLayer
              .selectAll("circle.rank")
              .data(top)
              .join("circle")
              .attr("class", "rank")
              .attr("cx", (item) => x(item.subscriberConversion))
              .attr("cy", (item) => y(`${labels.episodePrefix} ${item.episode}`) + y.bandwidth() / 2)
              .attr("r", 7)
              .attr("fill", "#ff6b3d");
          },
        )
      }
    />
  );
}
