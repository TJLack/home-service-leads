import fs from "node:fs/promises";
import path from "node:path";
import { LeadInput, ScanReport } from "../types/report.js";

const reportDir = path.join(process.cwd(), "data", "reports");
const leadFile = path.join(process.cwd(), "data", "leads.ndjson");

export async function saveReport(report: ScanReport): Promise<void> {
  await fs.mkdir(reportDir, { recursive: true });
  const filePath = path.join(reportDir, `${report.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
}

export async function getReport(reportId: string): Promise<ScanReport | null> {
  const filePath = path.join(reportDir, `${reportId}.json`);
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as ScanReport;
  } catch {
    return null;
  }
}

export async function saveLead(reportId: string, lead: LeadInput): Promise<void> {
  await fs.mkdir(path.dirname(leadFile), { recursive: true });
  const row = {
    reportId,
    ...lead,
    createdAt: new Date().toISOString(),
  };
  await fs.appendFile(leadFile, `${JSON.stringify(row)}\n`, "utf8");
}
