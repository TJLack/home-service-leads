export const CRAWL_CONFIG = {
  maxPages: 10,
  maxDepth: 2,
  timeoutMs: 12000,
};

export const PRIORITY_PATH_HINTS = [
  "service",
  "services",
  "about",
  "contact",
  "faq",
  "reviews",
  "testimonials",
  "areas",
  "locations",
  "cities",
  "estimate",
  "quote",
  "financing",
  "emergency",
];

export const SERVICE_KEYWORDS = [
  "roof",
  "hvac",
  "ac",
  "air conditioning",
  "plumbing",
  "electrical",
  "pressure washing",
  "landscaping",
  "fencing",
  "remodeling",
  "concrete",
  "junk removal",
  "cleaning",
  "foundation repair",
  "pest control",
  "pool",
  "contractor",
];

export const LOCATION_HINTS = [
  "texas",
  "tx",
  "dallas",
  "houston",
  "austin",
  "san antonio",
  "fort worth",
  "near me",
  "service area",
  "locations",
  "city",
];

export const TRUST_SIGNALS = [
  "licensed",
  "insured",
  "bonded",
  "5-star",
  "reviews",
  "testimonials",
  "years in business",
  "family-owned",
  "guarantee",
  "warranty",
  "certified",
  "award",
];

export const CTA_PATTERNS = [
  "call now",
  "get quote",
  "request estimate",
  "book now",
  "contact us",
  "schedule",
  "free estimate",
];

export const FAQ_PATTERNS = ["faq", "frequently asked", "how much", "how long", "what to expect"];

export const CHATBOT_PATTERNS = ["intercom", "drift", "livechat", "tawk", "chat", "zendesk"];

export const INDUSTRY_JOB_VALUES: Record<string, number> = {
  Roofing: 10000,
  HVAC: 6000,
  Plumbing: 600,
  Electrical: 800,
  "Pressure Washing": 300,
  Landscaping: 2000,
  Fencing: 4000,
  Remodeling: 15000,
  Concrete: 6000,
  "Junk Removal": 300,
  Cleaning: 200,
  "Foundation Repair": 12000,
  "Pest Control": 250,
  "Pool Services": 500,
  "General Home Services": 500,
};

export const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  Roofing: ["roof", "shingle", "reroof", "storm damage"],
  HVAC: ["hvac", "ac", "air conditioning", "heating", "furnace"],
  Plumbing: ["plumber", "plumbing", "drain", "water heater"],
  Electrical: ["electric", "panel", "rewire", "generator"],
  "Pressure Washing": ["pressure washing", "soft wash", "power wash"],
  Landscaping: ["landscape", "lawn", "irrigation"],
  Fencing: ["fence", "gate"],
  Remodeling: ["remodel", "renovation", "kitchen", "bathroom"],
  Concrete: ["concrete", "driveway", "slab"],
  "Junk Removal": ["junk", "haul away"],
  Cleaning: ["cleaning", "maid", "housekeeping"],
  "Foundation Repair": ["foundation", "pier", "slab repair"],
  "Pest Control": ["pest", "termite", "rodent"],
  "Pool Services": ["pool cleaning", "pool repair", "pool service"],
};
