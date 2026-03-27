import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const COVERAGE_INPUT_DIR = path.resolve(".nyc_output");
const COVERAGE_OUTPUT_DIR = path.resolve("coverage");
const COVERAGE_OUTPUT_FILE = path.join(COVERAGE_OUTPUT_DIR, "summary.json");
const COVERAGE_THRESHOLD = 80;

const createMetric = (covered, total) => ({
  covered,
  total,
  pct: total === 0 ? 100 : Number(((covered / total) * 100).toFixed(2)),
});

const mergeFileCoverage = (target, source) => {
  for (const [statementId, count] of Object.entries(source.s)) {
    target.s[statementId] = (target.s[statementId] ?? 0) + count;
  }

  for (const [functionId, count] of Object.entries(source.f)) {
    target.f[functionId] = (target.f[functionId] ?? 0) + count;
  }

  for (const [branchId, branchCounts] of Object.entries(source.b)) {
    target.b[branchId] = target.b[branchId] ?? branchCounts.map(() => 0);
    branchCounts.forEach((count, index) => {
      target.b[branchId][index] += count;
    });
  }
};

const buildMergedCoverage = async (coverageFiles) => {
  const merged = {};

  for (const fileName of coverageFiles) {
    const filePath = path.join(COVERAGE_INPUT_DIR, fileName);
    const json = JSON.parse(await readFile(filePath, "utf8"));

    for (const [sourcePath, coverage] of Object.entries(json)) {
      if (!merged[sourcePath]) {
        merged[sourcePath] = JSON.parse(JSON.stringify(coverage));
        continue;
      }

      mergeFileCoverage(merged[sourcePath], coverage);
    }
  }

  return merged;
};

const summarizeCoverage = (mergedCoverage) => {
  let statementsCovered = 0;
  let statementsTotal = 0;
  let functionsCovered = 0;
  let functionsTotal = 0;
  let branchesCovered = 0;
  let branchesTotal = 0;
  const lineHits = new Map();

  for (const coverage of Object.values(mergedCoverage)) {
    for (const [statementId, count] of Object.entries(coverage.s)) {
      statementsTotal += 1;
      if (count > 0) statementsCovered += 1;

      const lineNumber = coverage.statementMap[statementId]?.start?.line;
      if (lineNumber) {
        lineHits.set(lineNumber, (lineHits.get(lineNumber) ?? 0) + count);
      }
    }

    for (const count of Object.values(coverage.f)) {
      functionsTotal += 1;
      if (count > 0) functionsCovered += 1;
    }

    for (const branchCounts of Object.values(coverage.b)) {
      for (const count of branchCounts) {
        branchesTotal += 1;
        if (count > 0) branchesCovered += 1;
      }
    }
  }

  const linesTotal = lineHits.size;
  const linesCovered = [...lineHits.values()].filter((count) => count > 0).length;

  return {
    statements: createMetric(statementsCovered, statementsTotal),
    branches: createMetric(branchesCovered, branchesTotal),
    functions: createMetric(functionsCovered, functionsTotal),
    lines: createMetric(linesCovered, linesTotal),
  };
};

const assertThreshold = (summary) => {
  const failed = Object.entries(summary).filter(([, metric]) => metric.pct < COVERAGE_THRESHOLD);

  if (failed.length === 0) return;

  const details = failed
    .map(([name, metric]) => `${name}=${metric.pct}%`)
    .join(", ");

  throw new Error(
    `Coverage threshold not met. Expected at least ${COVERAGE_THRESHOLD}% for all metrics, got ${details}.`,
  );
};

const main = async () => {
  const coverageFiles = (await readdir(COVERAGE_INPUT_DIR)).filter((fileName) =>
    fileName.endsWith(".json"),
  );

  if (coverageFiles.length === 0) {
    throw new Error("No coverage artifacts were generated in .nyc_output.");
  }

  const mergedCoverage = await buildMergedCoverage(coverageFiles);
  const summary = summarizeCoverage(mergedCoverage);

  await rm(COVERAGE_OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(COVERAGE_OUTPUT_DIR, { recursive: true });
  await writeFile(COVERAGE_OUTPUT_FILE, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(JSON.stringify(summary, null, 2));
  assertThreshold(summary);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
