import { INDUSTRY_JOB_VALUES, INDUSTRY_KEYWORDS } from "../config/constants.js";
import { ExtractedPage, Recommendation, ScanIssue, ScanReport } from "../types/report.js";
import { clamp, round } from "../utils/text.js";

type ScoreBundle = {
  design: number;
  seo: number;
  conversion: number;
  aiReadiness: number;
  aiSubscores: ScanReport["subScores"]["aiReadiness"];
  issues: ScanIssue[];
  recommendations: Recommendation[];
  automationOpportunity: string;
};

export function buildReport(params: {
  id: string;
  submittedUrl: string;
  normalizedUrl: string;
  pages: ExtractedPage[];
  screenshots: { homepage?: string; mobileHomepage?: string };
}): ScanReport {
  const { id, submittedUrl, normalizedUrl, pages, screenshots } = params;
  const scoring = scoreSite(pages, screenshots);
  const industry = detectIndustry(pages);
  const revenue = estimateRevenue(pages, scoring, industry.industry);
  const overall = round(scoring.design * 0.24 + scoring.seo * 0.26 + scoring.conversion * 0.28 + scoring.aiReadiness * 0.22);

  return {
    id,
    submittedUrl,
    normalizedUrl,
    scannedAt: new Date().toISOString(),
    unlocked: false,
    siteSummary: {
      pagesScanned: pages.length,
      primaryIndustry: industry.industry,
      confidenceLevel: revenue.confidence,
    },
    screenshots,
    scores: {
      overall,
      design: scoring.design,
      seo: scoring.seo,
      conversion: scoring.conversion,
      aiReadiness: scoring.aiReadiness,
    },
    subScores: {
      aiReadiness: scoring.aiSubscores,
    },
    revenueOpportunity: revenue,
    topIssues: scoring.issues.slice(0, 5),
    recommendations: scoring.recommendations,
    pageFindings: pages.map((page) => ({
      url: page.url,
      pageType: page.pageType,
      title: page.title,
      wordCount: page.wordCount,
      issues: page.issues,
    })),
    automationOpportunity: scoring.automationOpportunity,
  };
}

function scoreSite(pages: ExtractedPage[], screenshots: { homepage?: string; mobileHomepage?: string }): ScoreBundle {
  const homepage = pages.find((p) => p.pageType === "homepage") || pages[0];
  const servicePages = pages.filter((p) => p.pageType === "service");
  const locationPages = pages.filter((p) => p.pageType === "location");
  const faqPages = pages.filter((p) => p.pageType === "faq");

  const avgWordCount = pages.length ? pages.reduce((a, p) => a + p.wordCount, 0) / pages.length : 0;
  const hasTrust = pages.some((p) => p.trustSignals.length > 0 || p.hasReviewSection || p.hasTrustBadge);
  const hasClearCta = pages.some((p) => p.ctaSignals.length > 0 || p.hasBookingButton || p.clickToCallLinks.length > 0);
  const hasContactPath = pages.some((p) => p.hasForm || p.contactLinks.length > 0 || p.clickToCallLinks.length > 0);
  const hasSchema = pages.some((p) => p.schemaTypes.length > 0);

  let design = 50;
  if (screenshots.mobileHomepage) design += 10;
  if (homepage && homepage.wordCount > 300) design += 8;
  if (homepage?.headingOrderValid) design += 8;
  if (hasClearCta) design += 12;
  if (hasTrust) design += 8;
  if (avgWordCount < 130) design -= 14;
  design = clamp(round(design), 15, 95);

  let seo = 45;
  seo += pages.filter((p) => !!p.title).length * 2;
  seo += pages.filter((p) => !!p.metaDescription).length * 1.5;
  seo += pages.filter((p) => p.h1.length > 0).length * 1.5;
  seo += servicePages.length * 2.8;
  seo += locationPages.length * 2.5;
  seo += faqPages.length * 2;
  if (avgWordCount > 250) seo += 7;
  if (hasSchema) seo += 5;
  seo = clamp(round(seo), 10, 98);

  let conversion = 38;
  if (hasClearCta) conversion += 18;
  if (hasContactPath) conversion += 16;
  if (hasTrust) conversion += 12;
  if (pages.some((p) => p.hasServiceAreaSection)) conversion += 6;
  if (pages.some((p) => p.hasFinancingSection)) conversion += 4;
  if (!hasClearCta) conversion -= 10;
  conversion = clamp(round(conversion), 8, 96);

  const aiContentClarity = clamp(round((homepage?.wordCount || 0) / 24 + (homepage?.h1.length || 0) * 4 + (servicePages.length > 0 ? 8 : 0)), 4, 25);
  const aiServiceLocation = clamp(round(servicePages.length * 4 + locationPages.length * 4 + (pages.some((p) => p.locationKeywords.length > 0) ? 6 : 0)), 3, 25);
  const aiTrust = clamp(round((hasTrust ? 10 : 3) + pages.filter((p) => p.hasReviewSection).length * 3 + pages.filter((p) => p.hasTrustBadge).length * 2), 2, 20);
  const aiAnswers = clamp(round(faqPages.length * 6 + pages.filter((p) => p.faqSignals.length > 0).length * 2 + pages.filter((p) => p.pricingSignals.length > 0).length * 2), 2, 20);
  const aiTechnical = clamp(round((hasSchema ? 3 : 0) + pages.filter((p) => p.h1.length > 0).length + pages.filter((p) => p.metaDescription).length * 0.8 + pages.filter((p) => p.imagesWithAlt > 0).length * 0.8), 1, 10);
  const aiReadiness = clamp(aiContentClarity + aiServiceLocation + aiTrust + aiAnswers + aiTechnical, 8, 98);

  const issues: ScanIssue[] = [];
  if (!hasClearCta) {
    issues.push({
      category: "conversion",
      title: "No clear CTA above the fold",
      explanation: "Visitors are not immediately told what step to take next.",
      impact: "Lead flow suffers because users hesitate or bounce.",
      recommendedFix: "Add a strong call-to-action button near the hero and repeat it through the page.",
      severity: "high",
    });
  }
  if (servicePages.length === 0) {
    issues.push({
      category: "seo",
      title: "Thin service page structure",
      explanation: "The site lacks dedicated service-focused content.",
      impact: "Search visibility and relevance for buyer intent queries are limited.",
      recommendedFix: "Create focused service pages with detailed scope, process, and proof.",
      severity: "high",
    });
  }
  if (!hasTrust) {
    issues.push({
      category: "conversion",
      title: "Weak trust proof",
      explanation: "Trust elements like reviews, guarantees, and credentials are minimal.",
      impact: "Higher hesitation means fewer calls and form submissions.",
      recommendedFix: "Add testimonials, ratings, certifications, and clear guarantees.",
      severity: "medium",
    });
  }
  if (aiAnswers < 10) {
    issues.push({
      category: "ai",
      title: "Limited answer-friendly content",
      explanation: "The site has little FAQ or direct-answer structure.",
      impact: "AI-driven search tools have less confidence to quote or recommend your business.",
      recommendedFix: "Add FAQ and service explainer sections with concise, direct answers.",
      severity: "medium",
    });
  }
  if (avgWordCount < 120) {
    issues.push({
      category: "design",
      title: "Thin page depth",
      explanation: "Core pages are light on content and structure.",
      impact: "Lower credibility, weaker engagement, and limited SEO context.",
      recommendedFix: "Expand page sections with service detail, proof, and clear process steps.",
      severity: "medium",
    });
  }

  const recommendations: Recommendation[] = [
    {
      title: "Add conversion-first hero CTAs",
      description: "Make phone and quote buttons highly visible at top of page and repeat them down the page.",
      priority: "high",
    },
    {
      title: "Build dedicated service + city pages",
      description: "Create pages that clearly pair each service with priority cities for stronger local relevance.",
      priority: "high",
    },
    {
      title: "Strengthen trust blocks",
      description: "Feature reviews, badges, and proof of results to improve confidence before contact.",
      priority: "medium",
    },
    {
      title: "Publish FAQ and direct answers",
      description: "Use clear Q&A content so AI-powered search tools can understand and summarize your expertise.",
      priority: "medium",
    },
  ];

  const hasChatWidget = pages.some((p) => p.chatWidgets.length > 0);
  const automationOpportunity = hasChatWidget
    ? "Chat widget detected. Consider tightening qualification flows so high-intent prospects route to calls faster."
    : "No chatbot/live chat detected. Adding a simple qualification chat can capture leads that would otherwise leave.";

  return {
    design,
    seo,
    conversion,
    aiReadiness,
    aiSubscores: {
      contentClarity: aiContentClarity,
      serviceLocationStructure: aiServiceLocation,
      trustAuthority: aiTrust,
      aiFriendlyAnswers: aiAnswers,
      technicalStructure: aiTechnical,
    },
    issues,
    recommendations,
    automationOpportunity,
  };
}

function detectIndustry(pages: ExtractedPage[]): { industry: string; confidence: number } {
  const corpus = pages.map((p) => `${p.title} ${p.text}`).join(" ").toLowerCase();
  let winner = "General Home Services";
  let best = 0;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    const score = keywords.reduce((sum, keyword) => sum + (corpus.includes(keyword.toLowerCase()) ? 1 : 0), 0);
    if (score > best) {
      best = score;
      winner = industry;
    }
  }

  return { industry: winner, confidence: best };
}

function estimateRevenue(pages: ExtractedPage[], scoring: ScoreBundle, industry: string): ScanReport["revenueOpportunity"] {
  const baseJobValue = INDUSTRY_JOB_VALUES[industry] ?? INDUSTRY_JOB_VALUES["General Home Services"];
  const textBlob = pages.map((p) => p.text).join(" ").toLowerCase();
  let modifier = 1;
  if (textBlob.includes("financing")) modifier += 0.15;
  if (textBlob.includes("emergency")) modifier += 0.1;
  if (textBlob.includes("premium") || textBlob.includes("custom")) modifier += 0.12;
  if (textBlob.includes("repair")) modifier -= 0.05;
  modifier = clamp(modifier, 0.75, 1.35);

  const avgJobValue = round(baseJobValue * modifier);

  const servicePages = pages.filter((p) => p.pageType === "service").length;
  const locationPages = pages.filter((p) => p.pageType === "location").length;
  const maturity = pages.length + servicePages * 1.8 + locationPages * 1.4;

  let estimatedTrafficLow = 100;
  let estimatedTrafficHigh = 300;
  if (maturity > 8 && scoring.seo >= 50) {
    estimatedTrafficLow = 300;
    estimatedTrafficHigh = 800;
  }
  if (maturity > 12 && scoring.seo >= 65) {
    estimatedTrafficLow = 800;
    estimatedTrafficHigh = 1800;
  }
  if (maturity > 16 && scoring.seo >= 75) {
    estimatedTrafficLow = 1200;
    estimatedTrafficHigh = 2400;
  }

  const currentConversionLow = clamp((scoring.conversion / 100) * 0.028, 0.005, 0.035);
  const currentConversionHigh = clamp(currentConversionLow + 0.008, 0.012, 0.04);

  const higherTicket = avgJobValue >= 3000;
  const projectedConversionLow = higherTicket ? 0.03 : 0.04;
  const projectedConversionHigh = higherTicket ? 0.06 : 0.08;

  const upliftLow = projectedConversionLow - currentConversionHigh;
  const upliftHigh = projectedConversionHigh - currentConversionLow;

  const lowMonthly = round(Math.max(0, estimatedTrafficLow * upliftLow * avgJobValue));
  const highMonthly = round(Math.max(lowMonthly + 1, estimatedTrafficHigh * upliftHigh * avgJobValue));

  const confidence: "low" | "medium" | "high" =
    pages.length < 4 ? "low" : pages.length > 7 && servicePages > 1 ? "high" : "medium";

  return {
    lowMonthly,
    highMonthly,
    lowAnnual: lowMonthly * 12,
    highAnnual: highMonthly * 12,
    avgJobValue,
    estimatedTrafficLow,
    estimatedTrafficHigh,
    currentConversionLow,
    currentConversionHigh,
    projectedConversionLow,
    projectedConversionHigh,
    confidence,
    narrative:
      "This is a conservative estimate based on your current site structure, conversion friction, and local home-service conversion benchmarks.",
  };
}
