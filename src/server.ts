import express from "express";
import path from "node:path";
import { nanoid } from "nanoid";
import { crawlSite } from "./services/crawler.js";
import { captureScreenshots } from "./services/screenshotService.js";
import { buildReport } from "./services/analysis.js";
import { getReport, saveLead, saveReport } from "./storage/storage.js";
import { normalizeUrl } from "./utils/urlHandler.js";
import { LeadInput } from "./types/report.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/screenshots", express.static(path.join(process.cwd(), "data", "screenshots")));

app.post("/api/scan", async (req, res) => {
  try {
    const submittedUrl = String(req.body?.url || "");
    const normalizedUrl = normalizeUrl(submittedUrl);
    const reportId = nanoid(10);

    const [pages, screenshots] = await Promise.all([
      crawlSite(normalizedUrl),
      captureScreenshots(normalizedUrl, reportId),
    ]);

    if (!pages.length) {
      return res.status(422).json({ error: "We couldn't crawl enough content from this site. Please try a different URL." });
    }

    const report = buildReport({
      id: reportId,
      submittedUrl,
      normalizedUrl,
      pages,
      screenshots,
    });

    await saveReport(report);

    return res.json({
      reportId,
      lockedPreview: {
        issuesFound: report.topIssues.length,
        overall: report.scores.overall,
        aiReadiness: report.scores.aiReadiness,
        monthlyLow: report.revenueOpportunity.lowMonthly,
        monthlyHigh: report.revenueOpportunity.highMonthly,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed.";
    return res.status(400).json({ error: message });
  }
});

app.post("/api/leads", async (req, res) => {
  const { reportId, lead } = req.body as { reportId?: string; lead?: LeadInput };
  if (!reportId || !lead) return res.status(400).json({ error: "Missing report ID or lead details." });

  const report = await getReport(reportId);
  if (!report) return res.status(404).json({ error: "Report not found." });

  if (!lead.name || !lead.email || !lead.phone || !lead.businessName || !lead.city) {
    return res.status(400).json({ error: "Please complete all required lead fields." });
  }

  await saveLead(reportId, lead);
  report.unlocked = true;
  await saveReport(report);
  return res.json({ success: true });
});

app.get("/api/report/:reportId", async (req, res) => {
  const report = await getReport(req.params.reportId);
  if (!report) return res.status(404).json({ error: "Report not found." });

  if (!report.unlocked) {
    return res.json({
      id: report.id,
      submittedUrl: report.submittedUrl,
      normalizedUrl: report.normalizedUrl,
      scannedAt: report.scannedAt,
      unlocked: false,
      scores: report.scores,
      revenueOpportunity: report.revenueOpportunity,
      topIssues: report.topIssues.slice(0, 3),
    });
  }

  return res.json(report);
});

app.get("*", (_, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Website Revenue Leak Detector running at http://localhost:${port}`);
});
