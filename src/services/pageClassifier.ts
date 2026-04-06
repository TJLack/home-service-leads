import { PageType } from "../types/report.js";

const CLASSIFIERS: Array<{ type: PageType; patterns: RegExp[] }> = [
  { type: "contact", patterns: [/contact/, /get-?quote/, /estimate/] },
  { type: "faq", patterns: [/faq/, /frequently-asked/, /questions/] },
  { type: "review/testimonial", patterns: [/review/, /testimonial/] },
  { type: "gallery/project", patterns: [/gallery/, /project/, /portfolio/] },
  { type: "location", patterns: [/location/, /service-area/, /areas/, /cities/] },
  { type: "service", patterns: [/service/, /roofing/, /plumbing/, /hvac/, /electrical/] },
  { type: "about", patterns: [/about/, /company/, /team/] },
];

export function classifyPage(url: string, title: string, h1: string[]): PageType {
  const target = `${url} ${title} ${h1.join(" ")}`.toLowerCase();
  if (new URL(url).pathname === "/") return "homepage";

  for (const classifier of CLASSIFIERS) {
    if (classifier.patterns.some((pattern) => pattern.test(target))) return classifier.type;
  }
  return "other";
}
