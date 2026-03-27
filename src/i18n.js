export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "poddata:locale";
export const SUPPORTED_LOCALES = [
  { id: "en", label: "English" },
  { id: "pt-BR", label: "Portugu\u00eas (Brasil)" },
];

const translations = {
  en: {
    toolbar: {
      eyebrow: "Application language",
      title: "Podcast analytics dashboard",
    },
    languageSwitcher: {
      label: "Switch language",
      ariaLabel: "Application language selector",
    },
    hero: {
      eyebrow: "React 19 + D3 Podcast Dashboard",
      title: "Find what actually grows your show.",
      description: {
        beforeCode: "This dashboard reads ",
        afterCode:
          " directly and turns it into six charts focused on growth, retention, loyalty, conversion, and content strategy.",
      },
      highlightsAriaLabel: "Podcast summary highlights",
      highlights: {
        catalogSize: {
          label: "Catalog size",
          detail: "episodes analyzed end-to-end",
        },
        reachBaseline: {
          label: "Reach baseline",
          detail: "total downloads across the dataset",
        },
        loyaltySignal: {
          label: "Loyalty signal",
          detail: "of listeners come back for more",
        },
      },
    },
    metrics: {
      episodesAnalyzed: {
        label: "Episodes analyzed",
        detail: "Full history available with remote fallback",
      },
      totalDownloads: {
        label: "Total downloads",
        detail: "Use this as your reach baseline",
      },
      averageCompletion: {
        label: "Average completion",
        detail: "Retention across the full catalog",
      },
      subscriberConversion: {
        label: "Subscriber conversion",
        detail: "Subscribers gained per download",
      },
    },
    sourceLabels: {
      loading: "Checking the remote CSV feed...",
      "local-file": "Using bundled data/data.csv as fallback",
      "local-file-fresh":
        "Using the local data/data.csv updated within the last 30 minutes",
      "local-file-fallback":
        "Remote feed unavailable, using local data/data.csv",
      "remote-cache": "Using cached remote data from the last 30 minutes",
      "remote-url": "Using the remote CSV feed and syncing data/data.csv",
    },
    recommendations: {
      heading: "Editorial recommendations",
      doubleDownOnTopic: {
        title: (topic) => `Double down on ${topic}`,
        detail: (downloads) =>
          `${downloads} average downloads per episode makes it your strongest reach category.`,
      },
      keepCoreFormat: {
        title: (band) => `Keep the core format around ${band}`,
        detail: (completionRate) =>
          `${completionRate} average completion is the best retention band in the dataset.`,
      },
      leanIntoGuestFormat: {
        title: (guestType) => `Lean into ${guestType} episodes for conversion`,
        detail: (conversionRate) =>
          `${conversionRate} subscriber conversion outperforms the alternative guest format.`,
      },
      reuseStrongestEpisode: {
        title: (episode) => `Reuse the playbook from episode ${episode}`,
        detail: (title) =>
          `"${title}" leads the blended efficiency score across completion, subscribers, shares, and loyal listeners.`,
      },
      promoteShareLeader: {
        title: (episode) => `Promote episodes that behave like episode ${episode}`,
        detail: (title) =>
          `"${title}" has the best sharing rate, which is a useful signal for clips and social-first campaigns.`,
      },
      deepenLoyalty: {
        title: (topic) => `Use ${topic} topics to deepen loyalty`,
        detail: (completionRate) =>
          `${completionRate} average completion suggests these episodes keep listeners around longest.`,
      },
    },
    charts: {
      growthTrend: {
        title: "1. Growth trend",
        note: "Downloads and completed listens by episode reveal breakout periods and weak stretches.",
        ariaLabel: "Growth trend chart",
        downloadsLegend: "Downloads",
        completedLegend: "Completed listens",
      },
      retentionScatter: {
        title: "2. Length vs retention",
        note: "This scatter plot helps you find the duration range that keeps listeners engaged without sacrificing reach.",
        ariaLabel: "Length versus retention scatter chart",
        durationAxis: "Duration (minutes)",
        completionAxis: "Completion rate",
        episodePrefix: "Ep",
      },
      audienceMix: {
        title: "3. Audience mix",
        note: "A stacked view of the latest 12 episodes shows whether recent growth comes from discovery or loyal listeners.",
        ariaLabel: "Audience mix chart",
      },
      topicLeaderboard: {
        title: "4. Topic leaderboard",
        note: "Average downloads by theme tell you which editorial lanes deserve more frequency.",
        ariaLabel: "Topic leaderboard chart",
      },
      shareToSubscribers: {
        title: "5. Shares to subscribers",
        note: "Episodes in the upper-right corner are your best candidates for clip distribution and promotion.",
        ariaLabel: "Shares to subscribers bubble chart",
        episodePrefix: "Ep",
      },
      bestConversionEpisodes: {
        title: "6. Best conversion episodes",
        note: "This ranking isolates the episodes that turn attention into subscribers most effectively.",
        ariaLabel: "Best conversion episodes ranking chart",
        episodePrefix: "Ep",
      },
    },
    taxonomy: {
      topics: {
        "Machine Learning": "Machine Learning",
        Agents: "Agents",
        Robotics: "Robotics",
        Cybersecurity: "Cybersecurity",
        "Cloud & Infrastructure": "Cloud & Infrastructure",
        Automation: "Automation",
        Other: "Other",
      },
      guestTypes: {
        "Panel / multi-guest": "Panel / multi-guest",
        "Single guest": "Single guest",
      },
      durationBands: {
        "<29 min": "<29 min",
        "29-31 min": "29-31 min",
        "31-33 min": "31-33 min",
        "33+ min": "33+ min",
      },
    },
  },
  "pt-BR": {
    toolbar: {
      eyebrow: "Idioma da aplica\u00e7\u00e3o",
      title: "Dashboard de analytics para podcast",
    },
    languageSwitcher: {
      label: "Trocar idioma",
      ariaLabel: "Seletor de idioma da aplica\u00e7\u00e3o",
    },
    hero: {
      eyebrow: "Dashboard de Podcast com React 19 + D3",
      title: "Descubra o que realmente faz seu podcast crescer.",
      description: {
        beforeCode: "Este dashboard l\u00ea ",
        afterCode:
          " diretamente e transforma o arquivo em seis gr\u00e1ficos focados em crescimento, reten\u00e7\u00e3o, lealdade, convers\u00e3o e estrat\u00e9gia de conte\u00fado.",
      },
      highlightsAriaLabel: "Destaques do resumo do podcast",
      highlights: {
        catalogSize: {
          label: "Tamanho do cat\u00e1logo",
          detail: "epis\u00f3dios analisados de ponta a ponta",
        },
        reachBaseline: {
          label: "Base de alcance",
          detail: "downloads totais no conjunto de dados",
        },
        loyaltySignal: {
          label: "Sinal de lealdade",
          detail: "dos ouvintes voltam para ouvir mais",
        },
      },
    },
    metrics: {
      episodesAnalyzed: {
        label: "Epis\u00f3dios analisados",
        detail: "Hist\u00f3rico completo com fallback remoto",
      },
      totalDownloads: {
        label: "Downloads totais",
        detail: "Use isso como sua base de alcance",
      },
      averageCompletion: {
        label: "Conclus\u00e3o m\u00e9dia",
        detail: "Reten\u00e7\u00e3o em todo o cat\u00e1logo",
      },
      subscriberConversion: {
        label: "Convers\u00e3o em inscritos",
        detail: "Inscritos ganhos por download",
      },
    },
    sourceLabels: {
      loading: "Verificando o feed remoto de CSV...",
      "local-file": "Usando data/data.csv embutido como fallback",
      "local-file-fresh":
        "Usando o data/data.csv local atualizado nos \u00faltimos 30 minutos",
      "local-file-fallback":
        "Feed remoto indispon\u00edvel, usando o data/data.csv local",
      "remote-cache": "Usando dados remotos em cache dos \u00faltimos 30 minutos",
      "remote-url": "Usando o feed CSV remoto e sincronizando data/data.csv",
    },
    recommendations: {
      heading: "Recomenda\u00e7\u00f5es editoriais",
      doubleDownOnTopic: {
        title: (topic) => `Aposte mais em ${topic}`,
        detail: (downloads) =>
          `${downloads} downloads m\u00e9dios por epis\u00f3dio fazem dessa a categoria com maior alcance.`,
      },
      keepCoreFormat: {
        title: (band) => `Mantenha o formato principal em torno de ${band}`,
        detail: (completionRate) =>
          `${completionRate} de conclus\u00e3o m\u00e9dia colocam essa faixa como a melhor reten\u00e7\u00e3o do conjunto.`,
      },
      leanIntoGuestFormat: {
        title: (guestType) => `Priorize epis\u00f3dios com ${guestType} para convers\u00e3o`,
        detail: (conversionRate) =>
          `${conversionRate} de convers\u00e3o em inscritos supera o formato alternativo de convidados.`,
      },
      reuseStrongestEpisode: {
        title: (episode) => `Reaproveite a f\u00f3rmula do epis\u00f3dio ${episode}`,
        detail: (title) =>
          `"${title}" lidera o score combinado de conclus\u00e3o, inscritos, compartilhamentos e ouvintes fi\u00e9is.`,
      },
      promoteShareLeader: {
        title: (episode) =>
          `Promova epis\u00f3dios com comportamento parecido com o epis\u00f3dio ${episode}`,
        detail: (title) =>
          `"${title}" tem a melhor taxa de compartilhamento, um sinal \u00fatil para cortes e campanhas sociais.`,
      },
      deepenLoyalty: {
        title: (topic) => `Use temas de ${topic} para aprofundar a lealdade`,
        detail: (completionRate) =>
          `${completionRate} de conclus\u00e3o m\u00e9dia sugerem que esses epis\u00f3dios ret\u00eam ouvintes por mais tempo.`,
      },
    },
    charts: {
      growthTrend: {
        title: "1. Tend\u00eancia de crescimento",
        note: "Downloads e escutas conclu\u00eddas por epis\u00f3dio revelam per\u00edodos de acelera\u00e7\u00e3o e fases mais fracas.",
        ariaLabel: "Gr\u00e1fico de tend\u00eancia de crescimento",
        downloadsLegend: "Downloads",
        completedLegend: "Escutas conclu\u00eddas",
      },
      retentionScatter: {
        title: "2. Dura\u00e7\u00e3o x reten\u00e7\u00e3o",
        note: "Este gr\u00e1fico de dispers\u00e3o ajuda a encontrar a faixa de dura\u00e7\u00e3o que mant\u00e9m o p\u00fablico engajado sem sacrificar alcance.",
        ariaLabel: "Gr\u00e1fico de dispers\u00e3o de dura\u00e7\u00e3o versus reten\u00e7\u00e3o",
        durationAxis: "Dura\u00e7\u00e3o (minutos)",
        completionAxis: "Taxa de conclus\u00e3o",
        episodePrefix: "Ep.",
      },
      audienceMix: {
        title: "3. Mix de audi\u00eancia",
        note: "Uma vis\u00e3o empilhada dos 12 epis\u00f3dios mais recentes mostra se o crescimento vem de descoberta ou de ouvintes leais.",
        ariaLabel: "Gr\u00e1fico de mix de audi\u00eancia",
      },
      topicLeaderboard: {
        title: "4. Ranking de temas",
        note: "A m\u00e9dia de downloads por tema mostra quais linhas editoriais merecem mais frequ\u00eancia.",
        ariaLabel: "Gr\u00e1fico de ranking de temas",
      },
      shareToSubscribers: {
        title: "5. Compartilhamentos para inscritos",
        note: "Epis\u00f3dios no canto superior direito s\u00e3o os melhores candidatos para distribui\u00e7\u00e3o de cortes e promo\u00e7\u00e3o.",
        ariaLabel: "Gr\u00e1fico de bolhas de compartilhamentos para inscritos",
        episodePrefix: "Ep.",
      },
      bestConversionEpisodes: {
        title: "6. Melhores epis\u00f3dios em convers\u00e3o",
        note: "Este ranking isola os epis\u00f3dios que transformam aten\u00e7\u00e3o em inscritos com mais efici\u00eancia.",
        ariaLabel: "Gr\u00e1fico de ranking dos melhores epis\u00f3dios em convers\u00e3o",
        episodePrefix: "Ep.",
      },
    },
    taxonomy: {
      topics: {
        "Machine Learning": "Aprendizado de M\u00e1quina",
        Agents: "Agentes",
        Robotics: "Rob\u00f3tica",
        Cybersecurity: "Ciberseguran\u00e7a",
        "Cloud & Infrastructure": "Cloud e Infraestrutura",
        Automation: "Automa\u00e7\u00e3o",
        Other: "Outros",
      },
      guestTypes: {
        "Panel / multi-guest": "painel ou m\u00faltiplos convidados",
        "Single guest": "convidado \u00fanico",
      },
      durationBands: {
        "<29 min": "menos de 29 min",
        "29-31 min": "29 a 31 min",
        "31-33 min": "31 a 33 min",
        "33+ min": "33+ min",
      },
    },
  },
};

export const getLocaleCopy = (locale) =>
  translations[locale] ?? translations[DEFAULT_LOCALE];

export const createFormatters = (locale) => {
  const numberFormatter = new Intl.NumberFormat(locale);
  const compactFormatter = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return {
    number: (value) => numberFormatter.format(value),
    compact: (value) => compactFormatter.format(value),
    percent: (value, maximumFractionDigits = 0) =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits,
        minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 1,
      }).format(value),
  };
};
