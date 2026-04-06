import { CRAWL_CONFIG, PRIORITY_PATH_HINTS } from "../config/constants.js";
import { ExtractedPage } from "../types/report.js";
import { extractPage } from "./pageExtractor.js";
import { httpFallback, normalizeUrl, sameDomain, shouldSkipUrl } from "../utils/urlHandler.js";

export async function crawlSite(startUrl: string): Promise<ExtractedPage[]> {
  const root = normalizeUrl(startUrl);
  const queue: Array<{ url: string; depth: number }> = [{ url: root, depth: 0 }];
  const seen = new Set<string>();
  const pages: ExtractedPage[] = [];

  while (queue.length > 0 && pages.length < CRAWL_CONFIG.maxPages) {
    queue.sort((a, b) => priorityScore(b.url) - priorityScore(a.url));
    const current = queue.shift();
    if (!current) break;
    if (seen.has(current.url) || current.depth > CRAWL_CONFIG.maxDepth) continue;
    seen.add(current.url);

    try {
      const response = await fetchWithProtocolFallback(current.url);
      if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) continue;

      const finalUrl = normalizeUrl(response.url);
      const html = await response.text();
      const page = extractPage(finalUrl, html, current.depth);
      pages.push(page);

      for (const href of page.internalLinks) {
        if (shouldSkipUrl(href)) continue;
        try {
          const resolved = normalizeUrl(new URL(href, finalUrl).toString());
          if (!sameDomain(root, resolved) || seen.has(resolved)) continue;
          queue.push({ url: resolved, depth: current.depth + 1 });
        } catch {
          // ignore invalid links
        }
      }
    } catch {
      // continue with partial crawl
    }
  }

  return pages;
}

async function fetchWithProtocolFallback(url: string): Promise<Response> {
  try {
    return await fetchWithTimeout(url);
  } catch {
    if (url.startsWith("https://")) {
      return fetchWithTimeout(httpFallback(url));
    }
    throw new Error("fetch-failed");
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CRAWL_CONFIG.timeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "KeyCityDigitalScanner/1.0" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function priorityScore(url: string): number {
  const lower = url.toLowerCase();
  let score = 0;
  for (const hint of PRIORITY_PATH_HINTS) {
    if (lower.includes(hint)) score += 3;
  }
  if (new URL(url).pathname === "/") score += 10;
  return score;
}
