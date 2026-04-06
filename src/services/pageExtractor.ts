import * as cheerio from "cheerio";
import {
  CTA_PATTERNS,
  FAQ_PATTERNS,
  LOCATION_HINTS,
  SERVICE_KEYWORDS,
  TRUST_SIGNALS,
  CHATBOT_PATTERNS,
} from "../config/constants.js";
import { countKeywordHits, normalizeText } from "../utils/text.js";
import { classifyPage } from "./pageClassifier.js";
import { ExtractedPage } from "../types/report.js";

export function extractPage(url: string, html: string, depth: number): ExtractedPage {
  const $ = cheerio.load(html);
  $("script,style,noscript").remove();

  const title = normalizeText($("title").first().text());
  const h1 = $("h1")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  const h2 = $("h2")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  const h3 = $("h3")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);

  const bodyText = normalizeText($("body").text());
  const words = bodyText ? bodyText.split(/\s+/) : [];

  const anchors = $("a")
    .map((_, el) => $(el).attr("href") || "")
    .get()
    .filter(Boolean);

  const navLinks = $("nav a")
    .map((_, el) => $(el).attr("href") || "")
    .get();

  const footerLinks = $("footer a")
    .map((_, el) => $(el).attr("href") || "")
    .get();

  const imageCount = $("img").length;
  const imagesWithAlt = $("img[alt]").length;

  const schemaTypes = $("script[type='application/ld+json']")
    .map((_, el) => {
      const raw = $(el).html() || "";
      if (raw.includes("LocalBusiness")) return "LocalBusiness";
      if (raw.includes("FAQPage")) return "FAQ";
      if (raw.includes("Review")) return "Review";
      if (raw.includes("Service")) return "Service";
      return "JSON-LD";
    })
    .get();

  const pageType = classifyPage(url, title, h1);
  const fullText = `${title} ${h1.join(" ")} ${h2.join(" ")} ${bodyText}`;

  return {
    url,
    depth,
    pageType,
    title,
    metaDescription: $("meta[name='description']").attr("content") || undefined,
    canonical: $("link[rel='canonical']").attr("href") || undefined,
    robots: $("meta[name='robots']").attr("content") || undefined,
    h1,
    h2,
    h3,
    headingOrderValid: h1.length <= 2 && h2.length >= h1.length,
    text: bodyText,
    wordCount: words.length,
    serviceKeywords: countKeywordHits(fullText, SERVICE_KEYWORDS),
    locationKeywords: countKeywordHits(fullText, LOCATION_HINTS),
    trustSignals: countKeywordHits(fullText, TRUST_SIGNALS),
    faqSignals: countKeywordHits(fullText, FAQ_PATTERNS),
    pricingSignals: countKeywordHits(fullText, ["price", "pricing", "cost", "affordable"]),
    financingSignals: countKeywordHits(fullText, ["financing", "payment", "monthly"]),
    ctaSignals: countKeywordHits(fullText, CTA_PATTERNS),
    internalLinks: anchors,
    navLinks,
    footerLinks,
    contactLinks: anchors.filter((href) => /contact|quote|estimate/i.test(href)),
    clickToCallLinks: anchors.filter((href) => href.startsWith("tel:")),
    formLinks: anchors.filter((href) => /contact|quote|estimate|book/i.test(href)),
    bookingLinks: anchors.filter((href) => /book|schedule|appointment/i.test(href)),
    hasForm: $("form").length > 0,
    hasContactSection: /contact|call|message us/i.test(bodyText),
    hasReviewSection: /review|testimonial|5-star|ratings/i.test(bodyText),
    hasTrustBadge: /licensed|insured|certified|award|guarantee/i.test(bodyText),
    hasFinancingSection: /financing|payment plans/i.test(bodyText),
    hasBookingButton: /book|schedule/i.test($("button").text()),
    hasServiceAreaSection: /service area|areas we serve|cities we serve/i.test(bodyText),
    imageCount,
    imagesWithAlt,
    hasGallerySignal: /gallery|our work|projects/i.test(bodyText),
    schemaTypes: [...new Set(schemaTypes)],
    chatWidgets: countKeywordHits(html, CHATBOT_PATTERNS),
    issues: [],
  };
}
