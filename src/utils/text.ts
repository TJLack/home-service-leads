export const normalizeText = (text: string): string =>
  text.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();

export const countKeywordHits = (text: string, keywords: string[]): string[] => {
  const lower = text.toLowerCase();
  return keywords.filter((keyword) => lower.includes(keyword.toLowerCase()));
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const round = (value: number): number => Math.round(value);
