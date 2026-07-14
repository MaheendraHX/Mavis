from duckduckgo_search import DDGS
from datetime import datetime

def web_search(query, max_results=5):
    """Free web search via DuckDuckGo. Combines news + web results for comprehensive coverage."""
    results = []
    
    try:
        with DDGS() as ddgs:
            # Always try news first — catches recent events (deaths, breaking news, etc.)
            try:
                news_results = list(ddgs.news(query, max_results=min(max_results, 5)))
                for r in news_results:
                    results.append({
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "snippet": r.get("body", ""),
                        "source": r.get("source", ""),
                        "date": r.get("date", ""),
                        "type": "news",
                    })
            except Exception:
                pass
            
            # Also get general web results
            try:
                web_results = list(ddgs.text(query, max_results=max_results))
                for r in web_results:
                    url = r.get("href", "")
                    # Skip duplicates (same domain already in news)
                    if not any(url in res.get("url", "") for res in results):
                        results.append({
                            "title": r.get("title", ""),
                            "url": url,
                            "snippet": r.get("body", ""),
                            "type": "web",
                        })
            except Exception:
                pass
            
    except Exception as e:
        print(f"Web search error: {e}")
    
    return results[:max_results]
