export type ConfidenceLevel = "low" | "medium" | "high";

export type ScoreCategory = "design" | "seo" | "conversion" | "ai";

export type PageType =
  | "homepage"
  | "service"
  | "location"
  | "about"
  | "contact"
  | "faq"
  | "review/testimonial"
  | "gallery/project"
  | "other";

export type ExtractedPage = {
  url: string;
  depth: number;
  pageType: PageType;
  title?: string;
  metaDescription?: string;
  canonical?: string;
  robots?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  headingOrderValid: boolean;
  text: string;
  wordCount: number;
  serviceKeywords: string[];
  locationKeywords: string[];
  trustSignals: string[];
  faqSignals: string[];
  pricingSignals: string[];
  financingSignals: string[];
  ctaSignals: string[];
  internalLinks: string[];
  navLinks: string[];
  footerLinks: string[];
  contactLinks: string[];
  clickToCallLinks: string[];
  formLinks: string[];
  bookingLinks: string[];
  hasForm: boolean;
  hasContactSection: boolean;
  hasReviewSection: boolean;
  hasTrustBadge: boolean;
  hasFinancingSection: boolean;
  hasBookingButton: boolean;
  hasServiceAreaSection: boolean;
  imageCount: number;
  imagesWithAlt: number;
  hasGallerySignal: boolean;
  schemaTypes: string[];
  chatWidgets: string[];
  issues: string[];
};

export type ScanIssue = {
  category: ScoreCategory;
  title: string;
  explanation: string;
  impact: string;
  recommendedFix: string;
  severity: "low" | "medium" | "high";
};

export type Recommendation = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
};

export type ScanReport = {
  id: string;
  submittedUrl: string;
  normalizedUrl: string;
  scannedAt: string;
  unlocked: boolean;
  siteSummary: {
    pagesScanned: number;
    primaryIndustry: string;
    confidenceLevel: ConfidenceLevel;
  };
  screenshots: {
    homepage?: string;
    mobileHomepage?: string;
  };
  scores: {
    overall: number;
    design: number;
    seo: number;
    conversion: number;
    aiReadiness: number;
  };
  subScores: {
    aiReadiness: {
      contentClarity: number;
      serviceLocationStructure: number;
      trustAuthority: number;
      aiFriendlyAnswers: number;
      technicalStructure: number;
    };
  };
  revenueOpportunity: {
    lowMonthly: number;
    highMonthly: number;
    lowAnnual: number;
    highAnnual: number;
    avgJobValue: number;
    estimatedTrafficLow: number;
    estimatedTrafficHigh: number;
    currentConversionLow: number;
    currentConversionHigh: number;
    projectedConversionLow: number;
    projectedConversionHigh: number;
    confidence: ConfidenceLevel;
    narrative: string;
  };
  topIssues: ScanIssue[];
  recommendations: Recommendation[];
  pageFindings: Array<{
    url: string;
    pageType?: string;
    title?: string;
    wordCount?: number;
    issues?: string[];
    scoreHints?: {
      design?: number;
      seo?: number;
      conversion?: number;
      ai?: number;
    };
  }>;
  automationOpportunity: string;
};

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  city: string;
  monthlyMarketingBudget?: string;
};
