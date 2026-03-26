import { useEffect, useState } from "react";
import * as d3 from "d3";
import {
  AudienceMixChart,
  ConversionBubbleChart,
  ConversionRankingChart,
  PerformanceTrendChart,
  RetentionScatterChart,
  TopicBarChart,
} from "./charts";
import {
  createFormatters,
  DEFAULT_LOCALE,
  getLocaleCopy,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
} from "./i18n";
import { fallbackDashboardData, loadPodcastDashboardData } from "./podcastData";

const buildMetricCards = (summaryMetrics, copy, formatters) => [
  {
    label: copy.metrics.episodesAnalyzed.label,
    value: formatters.number(summaryMetrics.totalEpisodes),
    detail: copy.metrics.episodesAnalyzed.detail,
  },
  {
    label: copy.metrics.totalDownloads.label,
    value: formatters.number(summaryMetrics.totalDownloads),
    detail: copy.metrics.totalDownloads.detail,
  },
  {
    label: copy.metrics.averageCompletion.label,
    value: formatters.percent(summaryMetrics.avgCompletionRate),
    detail: copy.metrics.averageCompletion.detail,
  },
  {
    label: copy.metrics.subscriberConversion.label,
    value: formatters.percent(summaryMetrics.subscriberConversion, 1),
    detail: copy.metrics.subscriberConversion.detail,
  },
];

const buildHeroHighlights = (summaryMetrics, copy, formatters) => [
  {
    label: copy.hero.highlights.catalogSize.label,
    value: formatters.number(summaryMetrics.totalEpisodes),
    detail: copy.hero.highlights.catalogSize.detail,
  },
  {
    label: copy.hero.highlights.reachBaseline.label,
    value: formatters.number(summaryMetrics.totalDownloads),
    detail: copy.hero.highlights.reachBaseline.detail,
  },
  {
    label: copy.hero.highlights.loyaltySignal.label,
    value: formatters.percent(summaryMetrics.returningShare),
    detail: copy.hero.highlights.loyaltySignal.detail,
  },
];

const buildRecommendations = (recommendationInsights, copy, formatters, locale) => {
  const topicLabel = (topic) => copy.taxonomy.topics[topic] ?? topic;
  const durationBandLabel = (band) => copy.taxonomy.durationBands[band] ?? band;
  const guestTypeLabel = (guestType) => copy.taxonomy.guestTypes[guestType] ?? guestType;
  const lowerGuestTypeLabel = guestTypeLabel(
    recommendationInsights.bestGuestFormat.guestType,
  ).toLocaleLowerCase(locale);

  return [
    {
      title: copy.recommendations.doubleDownOnTopic.title(
        topicLabel(recommendationInsights.bestTopic.topic),
      ),
      detail: copy.recommendations.doubleDownOnTopic.detail(
        formatters.number(Math.round(recommendationInsights.bestTopic.avgDownloads)),
      ),
    },
    {
      title: copy.recommendations.keepCoreFormat.title(
        durationBandLabel(recommendationInsights.bestRetentionBand.band),
      ),
      detail: copy.recommendations.keepCoreFormat.detail(
        formatters.percent(recommendationInsights.bestRetentionBand.avgCompletionRate),
      ),
    },
    {
      title: copy.recommendations.leanIntoGuestFormat.title(lowerGuestTypeLabel),
      detail: copy.recommendations.leanIntoGuestFormat.detail(
        formatters.percent(
          recommendationInsights.bestGuestFormat.avgSubscriberConversion,
          1,
        ),
      ),
    },
    {
      title: copy.recommendations.reuseStrongestEpisode.title(
        recommendationInsights.strongestEpisode.episode,
      ),
      detail: copy.recommendations.reuseStrongestEpisode.detail(
        recommendationInsights.strongestEpisode.title,
      ),
    },
    {
      title: copy.recommendations.promoteShareLeader.title(
        recommendationInsights.topShareEpisode.episode,
      ),
      detail: copy.recommendations.promoteShareLeader.detail(
        recommendationInsights.topShareEpisode.title,
      ),
    },
    {
      title: copy.recommendations.deepenLoyalty.title(
        topicLabel(recommendationInsights.topRetentionTopic.topic),
      ),
      detail: copy.recommendations.deepenLoyalty.detail(
        formatters.percent(recommendationInsights.topRetentionTopic.avgCompletionRate),
      ),
    },
  ];
};

const buildChartCards = (podcastData, topicPerformance, topicColors, copy, formatters) => [
  {
    title: copy.charts.growthTrend.title,
    note: copy.charts.growthTrend.note,
    component: (
      <PerformanceTrendChart
        data={podcastData}
        labels={copy.charts.growthTrend}
        formatters={formatters}
      />
    ),
  },
  {
    title: copy.charts.retentionScatter.title,
    note: copy.charts.retentionScatter.note,
    component: (
      <RetentionScatterChart
        data={podcastData}
        colors={topicColors}
        labels={copy.charts.retentionScatter}
        formatters={formatters}
      />
    ),
  },
  {
    title: copy.charts.audienceMix.title,
    note: copy.charts.audienceMix.note,
    component: (
      <AudienceMixChart
        data={podcastData}
        labels={copy.charts.audienceMix}
        formatters={formatters}
      />
    ),
  },
  {
    title: copy.charts.topicLeaderboard.title,
    note: copy.charts.topicLeaderboard.note,
    component: (
      <TopicBarChart
        data={topicPerformance}
        colors={topicColors}
        labels={copy.charts.topicLeaderboard}
        formatters={formatters}
        getTopicLabel={(topic) => copy.taxonomy.topics[topic] ?? topic}
      />
    ),
  },
  {
    title: copy.charts.shareToSubscribers.title,
    note: copy.charts.shareToSubscribers.note,
    component: (
      <ConversionBubbleChart
        data={podcastData}
        colors={topicColors}
        labels={copy.charts.shareToSubscribers}
        formatters={formatters}
      />
    ),
  },
  {
    title: copy.charts.bestConversionEpisodes.title,
    note: copy.charts.bestConversionEpisodes.note,
    component: (
      <ConversionRankingChart
        data={podcastData}
        labels={copy.charts.bestConversionEpisodes}
        formatters={formatters}
      />
    ),
  },
];

const readPreferredLocale = () => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return SUPPORTED_LOCALES.some((item) => item.id === storedLocale)
    ? storedLocale
    : DEFAULT_LOCALE;
};

export default function App() {
  const [dashboardData, setDashboardData] = useState(fallbackDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [locale, setLocale] = useState(readPreferredLocale);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const { podcastData, recommendationInsights, summaryMetrics, topicPerformance, source } =
    dashboardData;
  const copy = getLocaleCopy(locale);
  const formatters = createFormatters(locale);
  const topicColors = d3
    .scaleOrdinal()
    .domain(topicPerformance.map((item) => item.topic))
    .range(["#ff6b3d", "#ffd166", "#06d6a0", "#118ab2", "#6c8cff", "#ef476f"]);
  const metricCards = buildMetricCards(summaryMetrics, copy, formatters);
  const heroHighlights = buildHeroHighlights(summaryMetrics, copy, formatters);
  const recommendations = buildRecommendations(
    recommendationInsights,
    copy,
    formatters,
    locale,
  );
  const chartCardList = buildChartCards(
    podcastData,
    topicPerformance,
    topicColors,
    copy,
    formatters,
  );

  return (
    <main className="app-shell">
      <header className="app-toolbar">
        <div>
          <p className="app-toolbar__eyebrow">{copy.toolbar.eyebrow}</p>
          <h2 className="app-toolbar__title">{copy.toolbar.title}</h2>
        </div>
        <div className="language-switcher">
          <span>{copy.languageSwitcher.label}</span>
          <div
            className="language-switcher__controls"
            role="group"
            aria-label={copy.languageSwitcher.ariaLabel}
          >
            {SUPPORTED_LOCALES.map((language) => (
              <button
                key={language.id}
                type="button"
                className={
                  language.id === locale
                    ? "language-switcher__button is-active"
                    : "language-switcher__button"
                }
                onClick={() => setLocale(language.id)}
              >
                {language.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="hero-copy__main">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <h1>{copy.hero.title}</h1>
            <p className="hero-text">
              {copy.hero.description.beforeCode}
              <code>data/data.csv</code>
              {copy.hero.description.afterCode}
            </p>
            <p className="hero-source">
              {isLoading ? copy.sourceLabels.loading : copy.sourceLabels[source]}
            </p>
          </div>
          <div className="hero-highlights" aria-label={copy.hero.highlightsAriaLabel}>
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
          <h2>{copy.recommendations.heading}</h2>
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
