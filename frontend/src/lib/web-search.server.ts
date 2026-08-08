export type SearchResult = {
  title: string;
  url: string;
  domain: string;
  snippet: string;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function serperSearch(query: string, key: string): Promise<SearchResult[]> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 6 }),
  });
  if (!res.ok) throw new Error(`Serper failed [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as {
    organic?: { title?: string; link?: string; snippet?: string }[];
  };
  return (data.organic ?? []).slice(0, 6).map((r) => ({
    title: r.title ?? r.link ?? "Untitled",
    url: r.link ?? "",
    domain: domainOf(r.link ?? ""),
    snippet: r.snippet ?? "",
  }));
}

async function duckDuckGoSearch(query: string): Promise<SearchResult[]> {
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`DuckDuckGo failed [${res.status}]`);
  const html = await res.text();
  const results: SearchResult[] = [];
  const linkRe =
    /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html)) && results.length < 6) {
    let url = match[1];
    const uddg = /uddg=([^&]+)/.exec(url);
    if (uddg) url = decodeURIComponent(uddg[1]);
    if (!url.startsWith("http")) continue;
    results.push({
      title: stripTags(match[2]),
      url,
      domain: domainOf(url),
      snippet: "",
    });
  }
  return results;
}

export async function searchWeb(
  query: string,
): Promise<{ results: SearchResult[]; note?: string }> {
  const serperKey = process.env["SERPER_API_KEY"];
  try {
    const results = serperKey
      ? await serperSearch(query, serperKey)
      : await duckDuckGoSearch(query);
    if (results.length === 0) {
      return {
        results: [],
        note: "The search provider returned no usable results. Answer from your own knowledge and say the web lookup came back empty.",
      };
    }
    return { results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("web search failed:", message);
    return {
      results: [],
      note: `Web search is unavailable right now (${message}). Answer from your own knowledge and tell the user the live lookup failed.`,
    };
  }
}

export async function readUrl(url: string): Promise<{ url: string; title: string; text: string }> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Could not fetch ${url} [${res.status}]`);
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();
  if (contentType.includes("html")) {
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1] ?? url;
    return { url, title: stripTags(title), text: stripTags(body).slice(0, 8000) };
  }
  return { url, title: url, text: body.slice(0, 8000) };
}
