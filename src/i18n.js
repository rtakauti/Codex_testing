export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "poddata:locale";
export const SUPPORTED_LOCALES = [
  { id: "en", label: "English" },
  { id: "pt-BR", label: "Português (Brasil)" },
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
      eyebrow: "Idioma da aplicação",
      title: "Dashboard de analytics para podcast",
    },
    languageSwitcher: {
      label: "Trocar idioma",
      ariaLabel: "Seletor de idioma da aplicação",
    },
    hero: {
      eyebrow: "Dashboard de Podcast com React 19 + D3",
      title: "Descubra o que realmente faz seu podcast crescer.",
      description: {
        beforeCode: "Este dashboard lê ",
        afterCode:
          " diretamente e transforma o arquivo em seis gráficos focados em crescimento, retenção, lealdade, conversão e estratégia de conteúdo.",
      },
      highlightsAriaLabel: "Destaques do resumo do podcast",
      highlights: {
        catalogSize: {
          label: "Tamanho do catálogo",
          detail: "episódios analisados de ponta a ponta",
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
        label: "Episódios analisados",
        detail: "Histórico completo com fallback remoto",
      },
      totalDownloads: {
        label: "Downloads totais",
        detail: "Use isso como sua base de alcance",
      },
      averageCompletion: {
        label: "Conclusão média",
        detail: "Retenção em todo o catálogo",
      },
      subscriberConversion: {
        label: "Conversão em inscritos",
        detail: "Inscritos ganhos por download",
      },
    },
    sourceLabels: {
      loading: "Verificando o feed remoto de CSV...",
      "local-file": "Usando data/data.csv embutido como fallback",
      "local-file-fresh":
        "Usando o data/data.csv local atualizado nos últimos 30 minutos",
      "local-file-fallback":
        "Feed remoto indisponível, usando o data/data.csv local",
      "remote-cache": "Usando dados remotos em cache dos últimos 30 minutos",
      "remote-url": "Usando o feed CSV remoto e sincronizando data/data.csv",
    },
    recommendations: {
      heading: "Recomendações editoriais",
      doubleDownOnTopic: {
        title: (topic) => `Aposte mais em ${topic}`,
        detail: (downloads) =>
          `${downloads} downloads médios por episódio fazem dessa a categoria com maior alcance.`,
      },
      keepCoreFormat: {
        title: (band) => `Mantenha o formato principal em torno de ${band}`,
        detail: (completionRate) =>
          `${completionRate} de conclusão média colocam essa faixa como a melhor retenção do conjunto.`,
      },
      leanIntoGuestFormat: {
        title: (guestType) => `Priorize episódios com ${guestType} para conversão`,
        detail: (conversionRate) =>
          `${conversionRate} de conversão em inscritos supera o formato alternativo de convidados.`,
      },
      reuseStrongestEpisode: {
        title: (episode) => `Reaproveite a fórmula do episódio ${episode}`,
        detail: (title) =>
          `"${title}" lidera o score combinado de conclusão, inscritos, compartilhamentos e ouvintes fiéis.`,
      },
      promoteShareLeader: {
        title: (episode) => `Promova episódios com comportamento parecido com o episódio ${episode}`,
        detail: (title) =>
          `"${title}" tem a melhor taxa de compartilhamento, um sinal útil para cortes e campanhas sociais.`,
      },
      deepenLoyalty: {
        title: (topic) => `Use temas de ${topic} para aprofundar a lealdade`,
        detail: (completionRate) =>
          `${completionRate} de conclusão média sugerem que esses episódios retêm ouvintes por mais tempo.`,
      },
    },
    charts: {
      growthTrend: {
        title: "1. Tendência de crescimento",
        note: "Downloads e escutas concluídas por episódio revelam períodos de aceleração e fases mais fracas.",
        ariaLabel: "Gráfico de tendência de crescimento",
        downloadsLegend: "Downloads",
        completedLegend: "Escutas concluídas",
      },
      retentionScatter: {
        title: "2. Duração x retenção",
        note: "Este gráfico de dispersão ajuda a encontrar a faixa de duração que mantém o público engajado sem sacrificar alcance.",
        ariaLabel: "Gráfico de dispersão de duração versus retenção",
        durationAxis: "Duração (minutos)",
        completionAxis: "Taxa de conclusão",
        episodePrefix: "Ep.",
      },
      audienceMix: {
        title: "3. Mix de audiência",
        note: "Uma visão empilhada dos 12 episódios mais recentes mostra se o crescimento vem de descoberta ou de ouvintes leais.",
        ariaLabel: "Gráfico de mix de audiência",
      },
      topicLeaderboard: {
        title: "4. Ranking de temas",
        note: "A média de downloads por tema mostra quais linhas editoriais merecem mais frequência.",
        ariaLabel: "Gráfico de ranking de temas",
      },
      shareToSubscribers: {
        title: "5. Compartilhamentos para inscritos",
        note: "Episódios no canto superior direito são os melhores candidatos para distribuição de cortes e promoção.",
        ariaLabel: "Gráfico de bolhas de compartilhamentos para inscritos",
        episodePrefix: "Ep.",
      },
      bestConversionEpisodes: {
        title: "6. Melhores episódios em conversão",
        note: "Este ranking isola os episódios que transformam atenção em inscritos com mais eficiência.",
        ariaLabel: "Gráfico de ranking dos melhores episódios em conversão",
        episodePrefix: "Ep.",
      },
    },
    taxonomy: {
      topics: {
        "Machine Learning": "Aprendizado de Máquina",
        Agents: "Agentes",
        Robotics: "Robótica",
        Cybersecurity: "Cibersegurança",
        "Cloud & Infrastructure": "Cloud e Infraestrutura",
        Automation: "Automação",
        Other: "Outros",
      },
      guestTypes: {
        "Panel / multi-guest": "painel ou múltiplos convidados",
        "Single guest": "convidado único",
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

export const getLocaleCopy = (locale) => translations[locale] ?? translations[DEFAULT_LOCALE];

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
