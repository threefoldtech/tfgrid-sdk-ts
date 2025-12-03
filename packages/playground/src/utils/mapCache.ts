/**
 * Cache configuration for map-related resources
 */
const CACHE_CONFIG = [
  {
    pattern: (url: string) => url.endsWith("/all.csv") && url.includes("ISO-3166"),
    contentType: "text/csv",
  },
  {
    pattern: (url: string) => url.includes("countries-110m.json") || url.endsWith("/110m.json"),
    contentType: "application/json",
  },
] as const;

const cache = new Map<string, string>();
const promises = new Map<string, Promise<string>>();
const originalFetch = window.fetch;

async function getCached(url: string): Promise<string> {
  if (cache.has(url)) {
    return cache.get(url)!;
  }

  if (promises.has(url)) {
    return promises.get(url)!;
  }

  const promise = originalFetch(url)
    .then(res => res.text())
    .then(text => {
      cache.set(url, text);
      return text;
    })
    .finally(() => {
      promises.delete(url);
    });

  promises.set(url, promise);
  return promise;
}

function getUrlString(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

export function setupMapCache(): void {
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = getUrlString(input);

    for (const config of CACHE_CONFIG) {
      if (config.pattern(url)) {
        const content = await getCached(url);
        return new Response(content, {
          status: 200,
          headers: { "Content-Type": config.contentType },
        });
      }
    }

    return originalFetch(input, init);
  };
}
