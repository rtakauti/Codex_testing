import * as d3 from "d3";
import {
  podcastData,
  recommendations,
  summaryMetrics,
  topicPerformance,
} from "./podcastData";
import {
  AudienceMixChart,
  ConversionBubbleChart,
  ConversionRankingChart,
  PerformanceTrendChart,
  RetentionScatterChart,
  TopicBarChart,
} from "./charts";

const topicColors = d3
  .scaleOrdinal()
  .domain(topicPerformance.map((d) => d.topic))
  .range(["#ff6b3d", "#ffd166", "#06d6a0", "#118ab2", "#6c8cff", "#ef476f"]);

const metricCards = [
  {
    label: "Episodes analyzed",
    value: summaryMetrics.totalEpisodes.toString(),
    detail: "Full history pulled from data/data.csv",
  },
  {
    label: "Total downloads",
    value: summaryMetrics.totalDownloads.toLocaleString(),
    detail: "Use this as your reach baseline",
  },
  {
    label: "Average completion",
    value: d3.format(".0%")(summaryMetrics.avgCompletionRate),
    detail: "Retention across the full catalog",
  },
  {
    label: "Subscriber conversion",
    value: d3.format(".1%")(summaryMetrics.subscriberConversion),
    detail: "Subscribers gained per download",
  },
];

const chartCards = [
  {
    title: "1. Growth trend",
    note: "Downloads and completed listens by episode reveal breakout periods and weak stretches.",
    component: <PerformanceTrendChart data={podcastData} />,
  },
  {
    title: "2. Length vs retention",
    note: "This scatter plot helps you find the duration range that keeps listeners engaged without sacrificing reach.",
    component: <RetentionScatterChart data={podcastData} colors={topicColors} />,
  },
  {
    title: "3. Audience mix",
    note: "A stacked view of the latest 12 episodes shows whether recent growth comes from discovery or loyal listeners.",
    component: <AudienceMixChart data={podcastData} />,
  },
  {
    title: "4. Topic leaderboard",
    note: "Average downloads by theme tell you which editorial lanes deserve more frequency.",
    component: <TopicBarChart data={topicPerformance} colors={topicColors} />,
  },
  {
    title: "5. Shares to subscribers",
    note: "Episodes in the upper-right corner are your best candidates for clip distribution and promotion.",
    component: <ConversionBubbleChart data={podcastData} colors={topicColors} />,
  },
  {
    title: "6. Best conversion episodes",
    note: "This ranking isolates the episodes that turn attention into subscribers most effectively.",
    component: <ConversionRankingChart data={podcastData} />,
  },
];

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">React 19 + D3 Podcast Dashboard</p>
          <h1>Find what actually grows your show.</h1>
          <p className="hero-text">
            This dashboard reads <code>data/data.csv</code> directly and turns it into six charts focused on growth, retention, loyalty, conversion, and content strategy.
          </p>
        </div>
        <div className="hero-panel">
          <h2>Editorial recommendations</h2>
          <div className="recommendation-list">
            {recommendations.map((item) => (
              <article key={item.title} className="recommendation-card">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="metric-grid">
        {metricCards.map((card) => (
          <article key={card.label} className="metric-card">
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <span>{card.detail}</span>
          </article>
        ))}
      </section>

      <section className="chart-grid">
        {chartCards.map((card) => (
          <article key={card.title} className="chart-card">
            <div className="chart-card__header">
              <div>
                <h2>{card.title}</h2>
                <p>{card.note}</p>
              </div>
            </div>
            {card.component}
          </article>
        ))}
      </section>
    </main>
  );
}
