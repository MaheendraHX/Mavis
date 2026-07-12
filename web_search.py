import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

SEARCH_URL = "https://html.duckduckgo.com/html/"


def web_search(query, max_results=5):
    """Free live web search via DuckDuckGo's HTML endpoint. No API key required."""
    try:
        resp = requests.post(
            SEARCH_URL,
            data={"q": query},
            headers=HEADERS,
            timeout=10,
        )
        resp.raise_for_status()
    except Exception:
        return []

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        results = []

        for result in soup.select(".result"):
            link_tag = result.select_one(".result__a")
            snippet_tag = result.select_one(".result__snippet")

            if not link_tag:
                continue

            title = link_tag.get_text(strip=True)
            url = link_tag.get("href", "")
            snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""

            if title and url:
                results.append({"title": title, "url": url, "snippet": snippet})

            if len(results) >= max_results:
                break

        return results
    except Exception:
        return []
