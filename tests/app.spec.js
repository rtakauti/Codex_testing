import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const coverageDir = path.resolve(".nyc_output");
const csvFixturePath = path.resolve("data/data.csv");
const localeStorageKey = "poddata:locale";
const remoteCacheKey = "poddata:remote-csv-cache";
const portugueseLabel = "Português (Brasil)";
const portugueseGrowthLabel = "Gráfico de tendência de crescimento";
const portugueseRecommendationLabel = "Recomendações editoriais";

const persistCoverage = async (page, testInfo) => {
  const coverage = await page.evaluate(() => window.__coverage__ ?? null);
  expect(coverage).not.toBeNull();

  await mkdir(coverageDir, { recursive: true });
  const fileName = testInfo.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  await writeFile(
    path.join(coverageDir, `${fileName}.json`),
    `${JSON.stringify(coverage, null, 2)}\n`,
    "utf8",
  );
};

test.afterEach(async ({ page }, testInfo) => {
  await persistCoverage(page, testInfo);
});

test("renders the dashboard in English and switches to Portuguese", async ({ page }) => {
  const csvText = await readFile(csvFixturePath, "utf8");

  await page.route("**/api/podcast-data", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/csv; charset=utf-8",
      headers: {
        "X-Poddata-Source": "remote-url",
      },
      body: csvText,
    });
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Find what actually grows your show." }),
  ).toBeVisible();
  await expect(page.getByText("Using the remote CSV feed and syncing data/data.csv")).toBeVisible();
  await expect(page.getByRole("img", { name: "Growth trend chart" })).toBeVisible();
  await expect(page.getByRole("img")).toHaveCount(6);

  await page.getByRole("button", { name: portugueseLabel }).click({ force: true });

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Descubra o que realmente faz seu podcast crescer.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Usando o feed CSV remoto e sincronizando data/data.csv"),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: portugueseGrowthLabel }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByText(portugueseRecommendationLabel)).toBeVisible();

  const storedLocale = await page.evaluate(
    ({ key }) => window.localStorage.getItem(key),
    { key: localeStorageKey },
  );
  expect(storedLocale).toBe("pt-BR");
});

test("uses cached remote data and restores the stored locale", async ({ page }) => {
  const csvText = await readFile(csvFixturePath, "utf8");
  let requestCount = 0;

  await page.route("**/api/podcast-data", async (route) => {
    requestCount += 1;
    await route.abort();
  });

  await page.addInitScript(
    ({ cacheKey, localeKey, csv }) => {
      window.localStorage.setItem(localeKey, "pt-BR");
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({
          csvText: csv,
          fetchedAt: Date.now(),
        }),
      );
    },
    {
      cacheKey: remoteCacheKey,
      localeKey: localeStorageKey,
      csv: csvText,
    },
  );

  await page.goto("/");

  expect(requestCount).toBe(0);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Descubra o que realmente faz seu podcast crescer.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Usando dados remotos em cache dos últimos 30 minutos"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: portugueseLabel })).toHaveClass(
    /is-active/,
  );
});

test("falls back to bundled data when remote loading fails and invalid locale is stored", async ({
  page,
}) => {
  await page.addInitScript(({ cacheKey, localeKey }) => {
    window.localStorage.setItem(localeKey, "es");
    window.localStorage.setItem(cacheKey, "{bad json");
  }, {
    cacheKey: remoteCacheKey,
    localeKey: localeStorageKey,
  });

  await page.route("**/api/podcast-data", async (route) => {
    await route.abort("failed");
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Find what actually grows your show." }),
  ).toBeVisible();
  await expect(page.getByText("Remote feed unavailable, using local data/data.csv")).toBeVisible();
  await expect(page.getByRole("button", { name: "English" })).toHaveClass(/is-active/);
  await expect(page.getByLabel("Podcast summary highlights")).toBeVisible();
});

test("shows the loading source label before the remote response resolves", async ({ page }) => {
  const csvText = await readFile(csvFixturePath, "utf8");
  let fulfillRoute;
  let pendingRequest;

  await page.route("**/api/podcast-data", (route) => {
    pendingRequest = new Promise((resolve) => {
      fulfillRoute = async () => {
        await route.fulfill({
          status: 200,
          contentType: "text/csv; charset=utf-8",
          headers: {
            "X-Poddata-Source": "remote-url",
          },
          body: csvText,
        });
        resolve();
      };
    });

    return pendingRequest;
  });

  await page.goto("/");
  await expect(page.getByText("Checking the remote CSV feed...")).toBeVisible();
  expect(typeof fulfillRoute).toBe("function");
  await fulfillRoute();
  await pendingRequest;
  await expect(page.getByText("Using the remote CSV feed and syncing data/data.csv")).toBeVisible();
});

test("covers app helper branches for fallback labels and chart defaults", async ({ page }) => {
  const csvText = await readFile(csvFixturePath, "utf8");

  await page.route("**/api/podcast-data", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/csv; charset=utf-8",
      headers: {
        "X-Poddata-Source": "remote-url",
      },
      body: csvText,
    });
  });

  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__poddataTestUtils__)))
    .toBe(true);

  const helperResults = await page.evaluate(async () => {
    const { appTestUtils, chartTestUtils, createFormatters, getLocaleCopy } =
      window.__poddataTestUtils__;

    const copy = getLocaleCopy("pt-BR");
    const formatters = createFormatters("pt-BR");
    const recommendations = appTestUtils.buildRecommendations(
      {
        bestTopic: { topic: "Custom Topic", avgDownloads: 1234 },
        bestRetentionBand: { band: "45-50 min", avgCompletionRate: 0.42 },
        bestGuestFormat: {
          guestType: "Experimental format",
          avgSubscriberConversion: 0.123,
        },
        strongestEpisode: { episode: 7, title: "Future of Audio" },
        topShareEpisode: { episode: 9, title: "Community Clips" },
        topRetentionTopic: { topic: "Mystery", avgCompletionRate: 0.51 },
      },
      copy,
      formatters,
      "pt-BR",
    );

    const frameNode = document.createElement("div");
    const frame = chartTestUtils.chartFrame(frameNode, {
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      ariaLabel: "Test chart",
    });

    return {
      fallbackTopicTitle: recommendations[0].title,
      fallbackBandTitle: recommendations[1].title,
      fallbackGuestTitle: recommendations[2].title,
      frameWidth: frame.innerWidth,
      frameHeight: frame.innerHeight,
      svgCount: frameNode.querySelectorAll("svg").length,
    };
  });

  expect(helperResults.fallbackTopicTitle).toContain("Custom Topic");
  expect(helperResults.fallbackBandTitle).toContain("45-50 min");
  expect(helperResults.fallbackGuestTitle).toContain("experimental format");
  expect(helperResults.frameWidth).toBe(720);
  expect(helperResults.frameHeight).toBe(320);
  expect(helperResults.svgCount).toBe(1);
});

test("covers interactive chart zoom controls", async ({ page }) => {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__poddataTestUtils__)))
    .toBe(true);

  const zoomResults = await page.evaluate(async () => {
    const { chartTestUtils } = window.__poddataTestUtils__;
    const node = document.createElement("div");

    const controls = chartTestUtils.createInteractiveChart(
      node,
      {
        width: 360,
        height: 220,
        margin: { top: 12, right: 12, bottom: 12, left: 12 },
        ariaLabel: "Interactive test chart",
      },
      ({ axesLayer, contentLayer, innerHeight }) => {
        axesLayer
          .append("g")
          .attr("class", "test-axis")
          .attr("transform", `translate(0,${innerHeight})`)
          .append("line")
          .attr("x1", 0)
          .attr("x2", 220)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke", "#94a3b8");

        contentLayer
          .append("circle")
          .attr("class", "test-dot")
          .attr("cx", 120)
          .attr("cy", 90)
          .attr("r", 16)
          .attr("fill", "#ff6b3d");
      },
    );

    const initialScale = node.dataset.zoomScale;
    controls.zoomIn();
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const afterZoomInScale = node.dataset.zoomScale;
    const axisTransformAfterZoomIn = node.querySelector(".chart-axes").getAttribute("transform");
    const contentTransformAfterZoomIn = node.querySelector(".chart-content").getAttribute("transform");
    controls.zoomOut();
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const afterZoomOutScale = node.dataset.zoomScale;
    controls.reset();
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    return {
      initialScale,
      afterZoomInScale,
      axisTransformAfterZoomIn,
      contentTransformAfterZoomIn,
      afterZoomOutScale,
      resetScale: node.dataset.zoomScale,
      resetX: node.dataset.zoomX,
      resetY: node.dataset.zoomY,
    };
  });

  expect(zoomResults.initialScale).toBe("1");
  expect(zoomResults.afterZoomInScale).not.toBe("1");
  // Axis should remain static for TradeView-like behavior; only content transforms
  expect(zoomResults.axisTransformAfterZoomIn).toBeNull();
  expect(zoomResults.contentTransformAfterZoomIn).not.toBeNull();
  expect(zoomResults.contentTransformAfterZoomIn).not.toBe("");
  expect(zoomResults.afterZoomOutScale).toBe("1");
  expect(zoomResults.resetScale).toBe("1");
  expect(zoomResults.resetX).toBe("0");
  expect(zoomResults.resetY).toBe("0");
});

test("covers podcast data helper branches for cache parsing and remote responses", async ({
  page,
}) => {
  const csvText = await readFile(csvFixturePath, "utf8");

  await page.route("**/api/podcast-data", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/csv; charset=utf-8",
      headers: {
        "X-Poddata-Source": "remote-url",
      },
      body: csvText,
    });
  });

  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__poddataTestUtils__)))
    .toBe(true);

  const helperResults = await page.evaluate(async () => {
    const { podcastDataTestUtils } = window.__poddataTestUtils__;

    window.localStorage.removeItem("poddata:remote-csv-cache");
    const noCache = podcastDataTestUtils.readRemoteCache();

    window.localStorage.setItem(
      "poddata:remote-csv-cache",
      JSON.stringify({ csvText: "", fetchedAt: Date.now() }),
    );
    const incompleteCache = podcastDataTestUtils.readRemoteCache();

    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
    podcastDataTestUtils.writeRemoteCache("episode,title\n1,Test");
    Storage.prototype.setItem = originalSetItem;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async () => ({
      ok: true,
      text: async () => "episode,title\n1,Test",
      headers: { get: () => null },
    });
    const defaultRemoteSource = await podcastDataTestUtils.fetchRemoteCsv();

    window.fetch = async () => ({
      ok: false,
      status: 503,
      text: async () => "",
      headers: { get: () => null },
    });
    let failedStatus = "";
    try {
      await podcastDataTestUtils.fetchRemoteCsv();
    } catch (error) {
      failedStatus = error.message;
    }

    window.fetch = async () => ({
      ok: true,
      text: async () => "   ",
      headers: { get: () => null },
    });
    let emptyResponse = "";
    try {
      await podcastDataTestUtils.fetchRemoteCsv();
    } catch (error) {
      emptyResponse = error.message;
    }
    window.fetch = originalFetch;

    const customDashboard = podcastDataTestUtils.buildDashboardData(
      [
        "episode,title,description,guest,duration,downloads,completion_numbers,new_listeners,returning_listeners,subscribers_gained,social_media_shares",
        "1,Quick ML,forecasting talk,Host,00:28:00,1000,700,400,300,50,20",
        "2,Guest Panel,space exploration update,A and B,00:30:00,1200,800,500,300,60,22",
        "3,Secure Cloud,cloud reliability edge computing briefing,Host,00:32:00,900,540,450,150,30,18",
        "4,Workflow Notes,general ops chat,Host,00:35:00,800,400,500,100,20,10",
      ].join("\n"),
      "remote-url",
    );

    return {
      noCache,
      incompleteCache,
      defaultRemoteSource: defaultRemoteSource.source,
      failedStatus,
      emptyResponse,
      guestTypes: customDashboard.guestPerformance.map((item) => item.guestType),
      durationBands: customDashboard.durationPerformance.map((item) => item.band),
      topics: customDashboard.topicPerformance.map((item) => item.topic),
    };
  });

  expect(helperResults.noCache).toBeNull();
  expect(helperResults.incompleteCache).toBeNull();
  expect(helperResults.defaultRemoteSource).toBe("remote-url");
  expect(helperResults.failedStatus).toContain("503");
  expect(helperResults.emptyResponse).toContain("empty");
  expect(helperResults.guestTypes).toContain("Single guest");
  expect(helperResults.guestTypes).toContain("Panel / multi-guest");
  expect(helperResults.durationBands).toEqual(
    expect.arrayContaining(["<29 min", "29-31 min", "31-33 min", "33+ min"]),
  );
  expect(helperResults.topics).toEqual(
    expect.arrayContaining([
      "Machine Learning",
      "Robotics",
      "Cloud & Infrastructure",
      "Automation",
    ]),
  );
});
