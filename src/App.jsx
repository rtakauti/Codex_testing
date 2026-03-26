import { useEffect, useState } from "react";
import * as d3 from "d3";
import {
  fallbackDashboardData,
  loadPodcastDashboardData,
} from "./podcastData";
import {
  AudienceMixChart,
  ConversionBubbleChart,
  ConversionRankingChart,
  PerformanceTrendChart,
  RetentionScatterChart,
  TopicBarChart,
} from "./charts";

const dataSourceLabels = {
  "local-file": "Using bundled data/data.csv as fallback",
  "local-file-fresh": "Using the local data/data.csv updated within the last 30 minutes",
  "local-file-fallback": "Remote feed unavailable, using local data/data.csv",
  "remote-cache": "Using cached remote data from the last 30 minutes",
  "remote-url": "Using the remote CSV feed and syncing data/data.csv",
};

const buildMetricCards = (summaryMetrics) => [
  {
    label: "Episodes analyzed",
    value: summaryMetrics.totalEpisodes.toString(),
    detail: "Full history available with remote fallback",
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

const buildHeroHighlights = (summaryMetrics) => [
  {
    label: "Catalog size",
    value: summaryMetrics.totalEpisodes.toString(),
    detail: "episodes analyzed end-to-end",
  },
  {
    label: "Reach baseline",
    value: summaryMetrics.totalDownloads.toLocaleString(),
    detail: "total downloads across the dataset",
  },
  {
    label: "Loyalty signal",
    value: d3.format(".0%")(summaryMetrics.returningShare),
    detail: "of listeners come back for more",
  },
];

const chartCards = (podcastData, topicPerformance, topicColors) => [
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
  const [dashboardData, setDashboardData] = useState(fallbackDashboardData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncData = async () => {
      try {
        const nextData = await loadPodcastDashboardData();
        if (isMounted) {
          setDashboardData(nextData);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    syncData();

    return () => {
      isMounted = false;
    };
  }, []);

  const { podcastData, recommendations, summaryMetrics, topicPerformance, source } = dashboardData;
  const topicColors = d3
    .scaleOrdinal()
    .domain(topicPerformance.map((d) => d.topic))
    .range(["#ff6b3d", "#ffd166", "#06d6a0", "#118ab2", "#6c8cff", "#ef476f"]);
  const metricCards = buildMetricCards(summaryMetrics);
  const heroHighlights = buildHeroHighlights(summaryMetrics);
  const chartCardList = chartCards(podcastData, topicPerformance, topicColors);

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-copy__main">
            <p className="eyebrow">React 19 + D3 Podcast Dashboard</p>
            <h1>Find what actually grows your show.</h1>
            <p className="hero-text">
              This dashboard reads <code>data/data.csv</code> directly and turns it into six charts focused on growth, retention, loyalty, conversion, and content strategy.
            </p>
            <p className="hero-source">
              {isLoading ? "Checking the remote CSV feed..." : dataSourceLabels[source]}
            </p>
          </div>
          <div className="hero-highlights" aria-label="Podcast summary highlights">
            {heroHighlights.map((item) => (
              <article key={item.label} className="hero-highlight">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
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
        {chartCardList.map((card) => (
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
