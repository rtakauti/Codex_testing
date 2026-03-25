import { useEffect, useRef } from "react";
import * as d3 from "d3";

const useChart = (draw, dependencies) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    return draw(ref.current);
  }, dependencies);

  return ref;
};

const chartFrame = (node, { width = 720, height = 320, margin }) => {
  const svg = d3
    .select(node)
    .html("")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Podcast chart");

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { svg, g, innerWidth, innerHeight };
};

export function PerformanceTrendChart({ data }) {
  const ref = useChart(
    (node) => {
      const margin = { top: 24, right: 64, bottom: 36, left: 56 };
      const { g, innerWidth, innerHeight } = chartFrame(node, {
        width: 780,
        height: 330,
        margin,
      });
      const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.episode)).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.downloads)]).nice().range([innerHeight, 0]);
      const yRight = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.completionNumbers)])
        .nice()
        .range([innerHeight, 0]);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("~s")));
      g.append("g")
        .attr("transform", `translate(${innerWidth},0)`)
        .call(d3.axisRight(yRight).ticks(6).tickFormat(d3.format("~s")));

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#ff6b3d")
        .attr("stroke-width", 3)
        .attr("d", d3.line().x((d) => x(d.episode)).y((d) => y(d.downloads)).curve(d3.curveMonotoneX));

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#2dd4bf")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "6 5")
        .attr(
          "d",
          d3.line().x((d) => x(d.episode)).y((d) => yRight(d.completionNumbers)).curve(d3.curveMonotoneX),
        );

      const legend = g.append("g").attr("transform", "translate(8, 0)");
      [
        { color: "#ff6b3d", label: "Downloads" },
        { color: "#2dd4bf", label: "Completed listens" },
      ].forEach((item, index) => {
        const row = legend.append("g").attr("transform", `translate(${index * 170}, -8)`);
        row.append("line").attr("x1", 0).attr("x2", 26).attr("y1", 0).attr("y2", 0).attr("stroke", item.color).attr("stroke-width", 3);
        row.append("text").attr("x", 34).attr("y", 4).text(item.label);
      });
    },
    [data],
  );

  return <div className="chart-shell" ref={ref} />;
}

export function RetentionScatterChart({ data, colors }) {
  const ref = useChart(
    (node) => {
      const margin = { top: 18, right: 20, bottom: 44, left: 56 };
      const { g, innerWidth, innerHeight } = chartFrame(node, {
        width: 780,
        height: 330,
        margin,
      });
      const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.durationMinutes)).nice().range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0.45, d3.max(data, (d) => d.completionRate)]).nice().range([innerHeight, 0]);
      const r = d3.scaleSqrt().domain(d3.extent(data, (d) => d.downloads)).range([4, 16]);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(8));
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".0%")));

      g.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", (d) => x(d.durationMinutes))
        .attr("cy", (d) => y(d.completionRate))
        .attr("r", (d) => r(d.downloads))
        .attr("fill", (d) => colors(d.topic))
        .attr("fill-opacity", 0.78)
        .attr("stroke", "#08111f")
        .append("title")
        .text((d) => `Ep ${d.episode}: ${d.title}`);

      g.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 38).attr("text-anchor", "middle").text("Duration (minutes)");
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Completion rate");
    },
    [data, colors],
  );

  return <div className="chart-shell" ref={ref} />;
}

export function AudienceMixChart({ data }) {
  const ref = useChart(
    (node) => {
      const trimmed = data.slice(-12);
      const margin = { top: 18, right: 20, bottom: 42, left: 56 };
      const { g, innerWidth, innerHeight } = chartFrame(node, {
        width: 780,
        height: 330,
        margin,
      });
      const stack = d3.stack().keys(["newListeners", "returningListeners"])(trimmed);
      const x = d3.scaleBand().domain(trimmed.map((d) => d.episode)).range([0, innerWidth]).padding(0.22);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(trimmed, (d) => d.newListeners + d.returningListeners)])
        .nice()
        .range([innerHeight, 0]);
      const fill = d3.scaleOrdinal().domain(["newListeners", "returningListeners"]).range(["#ffd166", "#118ab2"]);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("~s")));

      g.append("g")
        .selectAll("g")
        .data(stack)
        .join("g")
        .attr("fill", (d) => fill(d.key))
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .attr("x", (d) => x(d.data.episode))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());
    },
    [data],
  );

  return <div className="chart-shell" ref={ref} />;
}

export function TopicBarChart({ data, colors }) {
  const ref = useChart(
    (node) => {
      const margin = { top: 18, right: 20, bottom: 36, left: 160 };
      const { g, innerWidth, innerHeight } = chartFrame(node, {
        width: 780,
        height: 330,
        margin,
      });
      const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d.avgDownloads)]).nice().range([0, innerWidth]);
      const y = d3.scaleBand().domain(data.map((d) => d.topic)).range([0, innerHeight]).padding(0.22);

      g.append("g").call(d3.axisLeft(y));
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("~s")));

      g.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d) => y(d.topic))
        .attr("width", (d) => x(d.avgDownloads))
        .attr("height", y.bandwidth())
        .attr("rx", 10)
        .attr("fill", (d) => colors(d.topic));

      g.selectAll(".label")
        .data(data)
        .join("text")
        .attr("class", "label")
        .attr("x", (d) => x(d.avgDownloads) + 8)
        .attr("y", (d) => y(d.topic) + y.bandwidth() / 2 + 4)
        .text((d) => Math.round(d.avgDownloads).toLocaleString());
    },
    [data, colors],
  );

  return <div className="chart-shell" ref={ref} />;
}

export function ConversionBubbleChart({ data, colors }) {
  const ref = useChart(
    (node) => {
      const margin = { top: 18, right: 20, bottom: 44, left: 56 };
      const { g, innerWidth, innerHeight } = chartFrame(node, {
        width: 780,
        height: 330,
        margin,
      });
      const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d.socialShares)]).nice().range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.subscribersGained)]).nice().range([innerHeight, 0]);
      const r = d3.scaleSqrt().domain(d3.extent(data, (d) => d.downloads)).range([4, 18]);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("~s")));
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("~s")));

      g.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", (d) => x(d.socialShares))
        .attr("cy", (d) => y(d.subscribersGained))
        .attr("r", (d) => r(d.downloads))
        .attr("fill", (d) => colors(d.topic))
        .attr("fill-opacity", 0.75)
        .attr("stroke", "#08111f")
        .append("title")
        .text((d) => `Ep ${d.episode}: ${d.title}`);
    },
    [data, colors],
  );

  return <div className="chart-shell" ref={ref} />;
}

export function ConversionRankingChart({ data }) {
  const ref = useChart(
    (node) => {
      const top = [...data]
        .sort((a, b) => d3.descending(a.subscriberConversion, b.subscriberConversion))
        .slice(0, 12)
        .sort((a, b) => d3.ascending(a.subscriberConversion, b.subscriberConversion));
      const margin = { top: 18, right: 30, bottom: 36, left: 220 };
      const { g, innerWidth, innerHeight } = chartFrame(node, {
        width: 780,
        height: 360,
        margin,
      });
      const x = d3.scaleLinear().domain([0, d3.max(top, (d) => d.subscriberConversion)]).nice().range([0, innerWidth]);
      const y = d3.scaleBand().domain(top.map((d) => `Ep ${d.episode}`)).range([innerHeight, 0]).padding(0.4);

      g.append("g").call(d3.axisLeft(y));
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".0%")));

      g.selectAll("line.rank")
        .data(top)
        .join("line")
        .attr("class", "rank")
        .attr("x1", 0)
        .attr("x2", (d) => x(d.subscriberConversion))
        .attr("y1", (d) => y(`Ep ${d.episode}`) + y.bandwidth() / 2)
        .attr("y2", (d) => y(`Ep ${d.episode}`) + y.bandwidth() / 2)
        .attr("stroke", "#6c8cff")
        .attr("stroke-width", 3);

      g.selectAll("circle.rank")
        .data(top)
        .join("circle")
        .attr("class", "rank")
        .attr("cx", (d) => x(d.subscriberConversion))
        .attr("cy", (d) => y(`Ep ${d.episode}`) + y.bandwidth() / 2)
        .attr("r", 7)
        .attr("fill", "#ff6b3d");
    },
    [data],
  );

  return <div className="chart-shell" ref={ref} />;
}
