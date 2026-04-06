# Key City Digital — Website Revenue Leak Detector

Production-oriented lead magnet app that crawls a submitted website, scores design/SEO/conversion/AI-readiness, estimates missed revenue, captures lead info, and unlocks a full report.

## Stack
- Node + TypeScript + Express
- Cheerio for extraction and parsing
- Playwright for server-side screenshots
- File-based storage (`data/reports`, `data/leads.ndjson`)

## Requirements
- Node 20+

## Run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Architecture
- `src/utils/urlHandler.ts` URL normalization and filtering
- `src/services/crawler.ts` server-side crawl engine
- `src/services/pageExtractor.ts` content and signal extraction
- `src/services/screenshotService.ts` headless screenshot capture
- `src/services/analysis.ts` scoring + AI readiness + revenue opportunity modeling
- `src/storage/storage.ts` report and lead persistence
- `src/server.ts` REST API and static hosting
- `public/` premium dark UI landing, scan state, lead gate, and report dashboard

## API
- `POST /api/scan` starts crawl + analysis and stores locked report
- `POST /api/leads` captures lead and unlocks report
- `GET /api/report/:reportId` returns locked preview or full unlocked report

No external API keys are required.
