from duckduckgo_search import DDGS

def web_search(query, max_results=5):
    """Free web search via DuckDuckGo's internal API. No API key required. Returns list of {title, url, snippet} dicts."""
    try:
        with DDGS() as ddgs:
            return [
                {"title": r.get("title", ""), "url": r.get("href", ""), "snippet": r.get("body", "")}
                for r in ddgs.text(query, max_results=max_results)
            ]
    except Exception as e:
        print(f"Web search error: {e}")
        return []
