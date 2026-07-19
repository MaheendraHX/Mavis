"""
Tools for Mavis — Calculator, Wikipedia, and more.
These are called by the AI model via tool-use or by the backend directly.
"""

import math
import re
import requests


def calculator(expression: str) -> str:
    """
    Safely evaluate a math expression.
    Supports: +, -, *, /, **, sqrt, sin, cos, tan, log, pi, e, abs, round, min, max, floor, ceil.
    """
    allowed_names = {
        'abs': abs, 'round': round, 'min': min, 'max': max,
        'sqrt': math.sqrt, 'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
        'log': math.log, 'log10': math.log10, 'log2': math.log2,
        'pi': math.pi, 'e': math.e, 'tau': math.tau,
        'floor': math.floor, 'ceil': math.ceil,
        'pow': pow, 'factorial': math.factorial,
    }

    # Sanitize: only allow safe characters
    sanitized = re.sub(r'[a-zA-Z0-9_\s\+\-\*/\.\(\)\,\%]+', '', expression)
    if sanitized:
        return f"Error: Invalid characters in expression: {sanitized}"

    try:
        result = eval(expression, {"__builtins__": {}}, allowed_names)
        if isinstance(result, float) and result == int(result) and abs(result) < 1e15:
            result = int(result)
        return str(result)
    except ZeroDivisionError:
        return "Error: Division by zero"
    except Exception as e:
        return f"Error calculating: {str(e)}"


def wikipedia_search(query: str, sentences: int = 3) -> str:
    """
    Search Wikipedia for a topic and return a summary.
    Falls back to search results if no direct article found.
    """
    try:
        # Try direct page first
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(query)}"
        headers = {'User-Agent': 'MavisBot/1.0 (portfolio project)'}
        resp = requests.get(url, headers=headers, timeout=5)

        if resp.status_code == 200:
            data = resp.json()
            title = data.get('title', query)
            extract = data.get('extract', 'No summary available.')
            page_url = data.get('content_urls', {}).get('desktop', {}).get('page', '')

            # Truncate to requested sentences
            if sentences and len(extract) > 0:
                sents = re.split(r'(?<=[.!?])\s+', extract)
                extract = ' '.join(sents[:sentences])

            result = f"**{title}**\n\n{extract}"
            if page_url:
                result += f"\n\n🔗 [Read more on Wikipedia]({page_url})"
            return result

        # Fallback: search for the topic
        search_url = "https://en.wikipedia.org/w/api.php"
        params = {
            'action': 'query',
            'list': 'search',
            'srsearch': query,
            'format': 'json',
            'srlimit': 3,
        }
        resp = requests.get(search_url, params=params, headers=headers, timeout=5)
        data = resp.json()

        results = data.get('query', {}).get('search', [])
        if not results:
            return f"No Wikipedia articles found for '{query}'."

        output = f"Search results for **{query}**:\n\n"
        for i, r in enumerate(results, 1):
            snippet = re.sub(r'<[^>]+>', '', r.get('snippet', ''))
            output += f"{i}. **{r['title']}** — {snippet}...\n"

        return output

    except requests.Timeout:
        return "Wikipedia search timed out. Please try again."
    except Exception as e:
        return f"Wikipedia search error: {str(e)}"


def get_tool_definitions():
    """Return tool definitions for the Groq API function calling."""
    return [
        {
            "type": "function",
            "function": {
                "name": "calculator",
                "description": "Calculate mathematical expressions. Use this for any math questions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "The math expression to evaluate, e.g. '(15 * 23) + sqrt(144)'"
                        }
                    },
                    "required": ["expression"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "wikipedia_search",
                "description": "Search Wikipedia for factual information about any topic.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The topic to search for on Wikipedia"
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    ]
