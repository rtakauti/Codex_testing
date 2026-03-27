import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REMOTE_CSV_URL = "https://pixelprowess.com/mockdata/podcastData.csv";
export const LOCAL_CSV_PATH = path.resolve(__dirname, "../data/data.csv");
export const LOCAL_CSV_MAX_AGE_MS = 30 * 60 * 1000;

const readLocalCsv = async () => {
  const csvText = await readFile(LOCAL_CSV_PATH, "utf8");
  const metadata = await stat(LOCAL_CSV_PATH);

  return {
    csvText,
    updatedAt: metadata.mtimeMs,
  };
};

export async function syncPodcastCsv() {
  const localCsv = await readLocalCsv();
  const localAgeMs = Date.now() - localCsv.updatedAt;

  if (localAgeMs < LOCAL_CSV_MAX_AGE_MS) {
    return {
      csvText: localCsv.csvText,
      source: "local-file-fresh",
      updatedFile: false,
    };
  }

  try {
    const response = await fetch(REMOTE_CSV_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Remote CSV request failed with status ${response.status}`);
    }

    const remoteCsvText = await response.text();
    if (!remoteCsvText.trim()) {
      throw new Error("Remote CSV response was empty");
    }

    await mkdir(path.dirname(LOCAL_CSV_PATH), { recursive: true });
    await writeFile(LOCAL_CSV_PATH, remoteCsvText, "utf8");

    return {
      csvText: remoteCsvText,
      source: "remote-url",
      updatedFile: true,
    };
  } catch {
    return {
      csvText: localCsv.csvText,
      source: "local-file-fallback",
      updatedFile: false,
    };
  }
}
