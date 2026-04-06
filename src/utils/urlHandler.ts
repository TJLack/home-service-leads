const TRACKING_PARAMS = ["utm_", "fbclid", "gclid", "msclkid"];

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Please enter a URL.");

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("Please enter a valid website URL.");
  }

  if (!url.hostname || !url.hostname.includes(".")) {
    throw new Error("Please enter a valid website URL.");
  }

  url.hash = "";
  url.searchParams.forEach((_, key) => {
    if (TRACKING_PARAMS.some((prefix) => key.startsWith(prefix))) {
      url.searchParams.delete(key);
    }
  });

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

export function httpFallback(url: string): string {
  const parsed = new URL(url);
  parsed.protocol = parsed.protocol === "https:" ? "http:" : parsed.protocol;
  return parsed.toString();
}

export function shouldSkipUrl(rawHref: string): boolean {
  const href = rawHref.toLowerCase();
  return (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("javascript:") ||
    href.includes("/wp-admin") ||
    href.includes("/admin") ||
    href.includes("/login") ||
    href.includes("/cart") ||
    /(\.pdf|\.zip|\.jpg|\.png|\.gif|\.svg|\.webp)$/i.test(href)
  );
}

export function sameDomain(urlA: string, urlB: string): boolean {
  const a = new URL(urlA);
  const b = new URL(urlB);
  const hostA = a.hostname.replace(/^www\./, "");
  const hostB = b.hostname.replace(/^www\./, "");
  return hostA === hostB;
}
