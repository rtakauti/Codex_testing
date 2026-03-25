import * as d3 from "d3";
import csvText from "../data/data.csv?raw";

const topicRules = [
  { topic: "Machine Learning", match: /(machine learning|ml\b|predictive|personalized medicine|risk scoring|forecasting|fraud detection)/i },
  { topic: "Agents", match: /\bagent|autonomous|knowledge management|deployment pipelines|advertising spend|financial transactions/i },
  { topic: "Robotics", match: /robotics?|robot\b|warehouse|agricultural|surgery|space exploration/i },
  { topic: "Cybersecurity", match: /cyber|phishing|fraud|threat|smart homes|log analysis|attacks/i },
  { topic: "Cloud & Infrastructure", match: /cloud|outages|edge computing|reliability|supply chain visibility/i },
  { topic: "Automation", match: /automation|automated|scheduling|transport|workflow|public transport/i },
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

export const podcastData = d3.csvParse(csvText, (row) => {
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

export const summaryMetrics = (() => {
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
})();

export const topicPerformance = d3
  .rollups(
    podcastData,
    (episodes) => ({
      episodes: episodes.length,
      avgDownloads: d3.mean(episodes, (d) => d.downloads),
      avgCompletionRate: d3.mean(episodes, (d) => d.completionRate),
      avgSubscriberConversion: d3.mean(episodes, (d) => d.subscriberConversion),
      avgShareRate: d3.mean(episodes, (d) => d.shareRate),
    }),
    (d) => d.topic,
  )
  .map(([topic, values]) => ({ topic, ...values }))
  .sort((a, b) => d3.descending(a.avgDownloads, b.avgDownloads));

export const durationPerformance = d3
  .rollups(
    podcastData,
    (episodes) => ({
      episodes: episodes.length,
      avgCompletionRate: d3.mean(episodes, (d) => d.completionRate),
      avgDownloads: d3.mean(episodes, (d) => d.downloads),
    }),
    (d) => d.durationBand,
  )
  .map(([band, values]) => ({ band, ...values }))
  .sort((a, b) => {
    const order = ["<29 min", "29-31 min", "31-33 min", "33+ min"];
    return order.indexOf(a.band) - order.indexOf(b.band);
  });

export const guestPerformance = d3
  .rollups(
    podcastData,
    (episodes) => ({
      episodes: episodes.length,
      avgDownloads: d3.mean(episodes, (d) => d.downloads),
      avgCompletionRate: d3.mean(episodes, (d) => d.completionRate),
      avgSubscriberConversion: d3.mean(episodes, (d) => d.subscriberConversion),
    }),
    (d) => d.guestType,
  )
  .map(([guestType, values]) => ({ guestType, ...values }))
  .sort((a, b) => d3.descending(a.avgDownloads, b.avgDownloads));

export const recommendations = (() => {
  const bestTopic = topicPerformance[0];
  const bestRetentionBand = durationPerformance.reduce((best, current) =>
    current.avgCompletionRate > best.avgCompletionRate ? current : best,
  );
  const bestGuestFormat = guestPerformance.reduce((best, current) =>
    current.avgSubscriberConversion > best.avgSubscriberConversion ? current : best,
  );
  const strongestEpisode = [...podcastData].sort((a, b) =>
    d3.descending(a.efficiencyScore, b.efficiencyScore),
  )[0];
  const topShareEpisode = [...podcastData].sort((a, b) =>
    d3.descending(a.shareRate, b.shareRate),
  )[0];
  const topRetentionTopic = [...topicPerformance].sort((a, b) =>
    d3.descending(a.avgCompletionRate, b.avgCompletionRate),
  )[0];

  return [
    {
      title: `Double down on ${bestTopic.topic}`,
      detail: `${Math.round(bestTopic.avgDownloads).toLocaleString()} average downloads per episode makes it your strongest reach category.`,
    },
    {
      title: `Keep the core format around ${bestRetentionBand.band}`,
      detail: `${d3.format(".0%")(bestRetentionBand.avgCompletionRate)} average completion is the best retention band in the dataset.`,
    },
    {
      title: `Lean into ${bestGuestFormat.guestType.toLowerCase()} episodes for conversion`,
      detail: `${d3.format(".1%")(bestGuestFormat.avgSubscriberConversion)} subscriber conversion outperforms the alternative guest format.`,
    },
    {
      title: `Reuse the playbook from episode ${strongestEpisode.episode}`,
      detail: `"${strongestEpisode.title}" leads the blended efficiency score across completion, subscribers, shares, and loyal listeners.`,
    },
    {
      title: `Promote episodes that behave like episode ${topShareEpisode.episode}`,
      detail: `"${topShareEpisode.title}" has the best sharing rate, which is a useful signal for clips and social-first campaigns.`,
    },
    {
      title: `Use ${topRetentionTopic.topic} topics to deepen loyalty`,
      detail: `${d3.format(".0%")(topRetentionTopic.avgCompletionRate)} average completion suggests these episodes keep listeners around longest.`,
    },
  ];
})();
