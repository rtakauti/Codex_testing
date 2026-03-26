import * as d3 from "d3";
import csvText from "../data/data.csv?raw";

const REMOTE_SYNC_URL = "/api/podcast-data";
const REMOTE_CACHE_KEY = "poddata:remote-csv-cache";
const REMOTE_CACHE_TTL_MS = 30 * 60 * 1000;

const topicRules = [
  {
    topic: "Machine Learning",
    match:
      /(machine learning|ml\b|predictive|personalized medicine|risk scoring|forecasting|fraud detection)/i,
  },
  {
    topic: "Agents",
    match:
      /\bagent|autonomous|knowledge management|deployment pipelines|advertising spend|financial transactions/i,
  },
  {
    topic: "Robotics",
    match: /robotics?|robot\b|warehouse|agricultural|surgery|space exploration/i,
  },
  {
    topic: "Cybersecurity",
    match: /cyber|phishing|fraud|threat|smart homes|log analysis|attacks/i,
  },
  {
    topic: "Cloud & Infrastructure",
    match: /cloud|outages|edge computing|reliability|supply chain visibility/i,
  },
  {
    topic: "Automation",
    match: /automation|automated|scheduling|transport|workflow|public transport/i,
  },
];

const durationBand = (minutes) => {
  if (minutes < 29) return "<29 min";
  if (minutes < 31) return "29-31 min";
  if (minutes < 33) return "31-33 min";
  return "33+ min";
};

const parseDuration = (value) => {
  const [hours, minutes, seconds] = value.split(":").map(Number);
  return hours * 60 + minutes + seconds / 60;
};

const inferTopic = (title, description) => {
  const haystack = `${title} ${description}`;

  for (const rule of topicRules) {
    if (rule.match.test(haystack)) return rule.topic;
  }

  return "Other";
};

const parsePodcastData = (sourceCsvText) =>
  d3.csvParse(sourceCsvText, (row) => {
    const downloads = Number(row.downloads);
    const completionNumbers = Number(row.completion_numbers);
    const newListeners = Number(row.new_listeners);
    const returningListeners = Number(row.returning_listeners);
    const subscribersGained = Number(row.subscribers_gained);
    const socialShares = Number(row.social_media_shares);
    const durationMinutes = parseDuration(row.duration);
    const topic = inferTopic(row.title, row.description);
    const isMultiGuest = /\sand\s|,/.test(row.guest);

    return {
      episode: Number(row.episode),
      title: row.title,
      description: row.description,
      guest: row.guest,
      duration: row.duration,
      durationMinutes,
      durationBand: durationBand(durationMinutes),
      topic,
      downloads,
      completionNumbers,
      completionRate: completionNumbers / downloads,
      newListeners,
      returningListeners,
      audienceTotal: newListeners + returningListeners,
      newListenerShare: newListeners / (newListeners + returningListeners),
      returningShare: returningListeners / (newListeners + returningListeners),
      subscribersGained,
      subscriberConversion: subscribersGained / downloads,
      socialShares,
      shareRate: socialShares / downloads,
      efficiencyScore:
        (completionNumbers * 0.35 +
          subscribersGained * 14 +
          socialShares * 2.5 +
          returningListeners * 0.5) /
        downloads,
      guestType: isMultiGuest ? "Panel / multi-guest" : "Single guest",
    };
  });

const buildSummaryMetrics = (podcastData) => {
  const totals = podcastData.reduce(
    (accumulator, episode) => {
      accumulator.downloads += episode.downloads;
      accumulator.completions += episode.completionNumbers;
      accumulator.newListeners += episode.newListeners;
      accumulator.returningListeners += episode.returningListeners;
      accumulator.subscribers += episode.subscribersGained;
      accumulator.shares += episode.socialShares;
      return accumulator;
    },
    {
      downloads: 0,
      completions: 0,
      newListeners: 0,
      returningListeners: 0,
      subscribers: 0,
      shares: 0,
    },
  );

  return {
    totalEpisodes: podcastData.length,
    totalDownloads: totals.downloads,
    avgCompletionRate: totals.completions / totals.downloads,
    subscriberConversion: totals.subscribers / totals.downloads,
    returningShare:
      totals.returningListeners / (totals.newListeners + totals.returningListeners),
    shareRate: totals.shares / totals.downloads,
  };
};

const buildTopicPerformance = (podcastData) =>
  d3
    .rollups(
      podcastData,
      (episodes) => ({
        episodes: episodes.length,
        avgDownloads: d3.mean(episodes, (item) => item.downloads),
        avgCompletionRate: d3.mean(episodes, (item) => item.completionRate),
        avgSubscriberConversion: d3.mean(
          episodes,
          (item) => item.subscriberConversion,
        ),
        avgShareRate: d3.mean(episodes, (item) => item.shareRate),
      }),
      (item) => item.topic,
    )
    .map(([topic, values]) => ({ topic, ...values }))
    .sort((left, right) => d3.descending(left.avgDownloads, right.avgDownloads));

const buildDurationPerformance = (podcastData) =>
  d3
    .rollups(
      podcastData,
      (episodes) => ({
        episodes: episodes.length,
        avgCompletionRate: d3.mean(episodes, (item) => item.completionRate),
        avgDownloads: d3.mean(episodes, (item) => item.downloads),
      }),
      (item) => item.durationBand,
    )
    .map(([band, values]) => ({ band, ...values }))
    .sort((left, right) => {
      const order = ["<29 min", "29-31 min", "31-33 min", "33+ min"];
      return order.indexOf(left.band) - order.indexOf(right.band);
    });

const buildGuestPerformance = (podcastData) =>
  d3
    .rollups(
      podcastData,
      (episodes) => ({
        episodes: episodes.length,
        avgDownloads: d3.mean(episodes, (item) => item.downloads),
        avgCompletionRate: d3.mean(episodes, (item) => item.completionRate),
        avgSubscriberConversion: d3.mean(
          episodes,
          (item) => item.subscriberConversion,
        ),
      }),
      (item) => item.guestType,
    )
    .map(([guestType, values]) => ({ guestType, ...values }))
    .sort((left, right) => d3.descending(left.avgDownloads, right.avgDownloads));

const buildRecommendationInsights = (
  podcastData,
  topicPerformance,
  durationPerformance,
  guestPerformance,
) => {
  const bestTopic = topicPerformance[0];
  const bestRetentionBand = durationPerformance.reduce((best, current) =>
    current.avgCompletionRate > best.avgCompletionRate ? current : best,
  );
  const bestGuestFormat = guestPerformance.reduce((best, current) =>
    current.avgSubscriberConversion > best.avgSubscriberConversion ? current : best,
  );
  const strongestEpisode = [...podcastData].sort((left, right) =>
    d3.descending(left.efficiencyScore, right.efficiencyScore),
  )[0];
  const topShareEpisode = [...podcastData].sort((left, right) =>
    d3.descending(left.shareRate, right.shareRate),
  )[0];
  const topRetentionTopic = [...topicPerformance].sort((left, right) =>
    d3.descending(left.avgCompletionRate, right.avgCompletionRate),
  )[0];

  return {
    bestTopic,
    bestRetentionBand,
    bestGuestFormat,
    strongestEpisode,
    topShareEpisode,
    topRetentionTopic,
  };
};

const buildDashboardData = (sourceCsvText, source) => {
  const podcastData = parsePodcastData(sourceCsvText);
  const summaryMetrics = buildSummaryMetrics(podcastData);
  const topicPerformance = buildTopicPerformance(podcastData);
  const durationPerformance = buildDurationPerformance(podcastData);
  const guestPerformance = buildGuestPerformance(podcastData);
  const recommendationInsights = buildRecommendationInsights(
    podcastData,
    topicPerformance,
    durationPerformance,
    guestPerformance,
  );

  return {
    podcastData,
    recommendationInsights,
    summaryMetrics,
    topicPerformance,
    durationPerformance,
    guestPerformance,
    source,
  };
};

const readRemoteCache = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(REMOTE_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.csvText || !parsed?.fetchedAt) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeRemoteCache = (remoteCsvText) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      REMOTE_CACHE_KEY,
      JSON.stringify({
        csvText: remoteCsvText,
        fetchedAt: Date.now(),
      }),
    );
  } catch {
    // Ignore cache write failures and keep the app usable.
  }
};

const fetchRemoteCsv = async () => {
  const response = await fetch(REMOTE_SYNC_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Remote CSV request failed with status ${response.status}`);
  }

  const remoteCsvText = await response.text();
  if (!remoteCsvText.trim()) {
    throw new Error("Remote CSV response was empty");
  }

  return {
    csvText: remoteCsvText,
    source: response.headers.get("X-Poddata-Source") ?? "remote-url",
  };
};

export async function loadPodcastDashboardData() {
  const fallbackData = buildDashboardData(csvText, "local-file");
  const cachedRemote = readRemoteCache();

  if (cachedRemote && Date.now() - cachedRemote.fetchedAt < REMOTE_CACHE_TTL_MS) {
    return buildDashboardData(cachedRemote.csvText, "remote-cache");
  }

  try {
    const remoteResult = await fetchRemoteCsv();
    writeRemoteCache(remoteResult.csvText);
    return buildDashboardData(remoteResult.csvText, remoteResult.source);
  } catch {
    return fallbackData;
  }
}

export const fallbackDashboardData = buildDashboardData(csvText, "local-file");
