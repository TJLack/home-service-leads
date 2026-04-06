import fs from "node:fs/promises";
import path from "node:path";

export async function captureScreenshots(url: string, reportId: string): Promise<{ homepage?: string; mobileHomepage?: string }> {
  const targetDir = path.join(process.cwd(), "data", "screenshots");
  const result: { homepage?: string; mobileHomepage?: string } = {};

  try {
    await fs.mkdir(targetDir, { recursive: true });

    const playwrightModule = await import("playwright");
    const browser = await playwrightModule.chromium.launch({ headless: true });

    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const mobilePath = path.join(targetDir, `${reportId}-mobile.png`);
    await page.screenshot({ path: mobilePath, fullPage: true });
    result.mobileHomepage = `/screenshots/${reportId}-mobile.png`;

    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const desktopPath = path.join(targetDir, `${reportId}-desktop.png`);
    await desktopPage.screenshot({ path: desktopPath, fullPage: true });
    result.homepage = `/screenshots/${reportId}-desktop.png`;

    await browser.close();
  } catch {
    // fail gracefully when Playwright or browser binaries are unavailable
  }

  return result;
}
