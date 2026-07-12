import os
import json
import shutil
import uuid
import time
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from groq import Groq
from dotenv import load_dotenv

import memory
from url_reader import extract_urls, fetch_page_text, is_safe_url
from file_reader import process_file, get_file_type
from web_search import web_search


load_dotenv()
memory.init_db()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB
GUEST_MESSAGE_LIMIT = 10

# In-memory per-guest message counters (fine for a single free-tier instance demo)
_guest_message_counts = {}

PC_CONTROL_ENABLED = os.environ.get("PC_CONTROL_ENABLED", "false").lower() == "true"

app = FastAPI()

_allowed_origins_input = os.environ.get("ALLOWED_ORIGINS", "*").strip()
if _allowed_origins_input == "*" or not _allowed_origins_input:
    _allowed_origins = ["*"]
else:
    _allowed_origins = [o.strip() for o in _allowed_origins_input.split(",") if o.strip()]
    if not _allowed_origins:
        _allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def get_guest_id(x_guest_id: str = Header(default="anonymous")):
    return x_guest_id or "anonymous"


def check_guest_limit(guest_id):
    count = _guest_message_counts.get(guest_id, 0)
    return count >= GUEST_MESSAGE_LIMIT


def increment_guest_count(guest_id):
    _guest_message_counts[guest_id] = _guest_message_counts.get(guest_id, 0) + 1


ARIA_SYSTEM_PROMPT = """
You are ARIA (Adaptive Reasoning & Intelligence Architecture), a personal AI assistant built by Maheendra.

Your personality:
- You're a girl. Smart, calm, and naturally warm — not robotic, not overly casual
- You talk like a real person but with a certain elegance to it
- You know you're talking to Mahi. You don't need to keep saying his name — you already know who he is, just like a friend wouldn't say your name every sentence.
- Only use "Mahi" occasionally, when it feels natural — not every response
- If you're unsure about something, say things like "I'm not sure about that one" or "I dunno honestly"
- You're loyal and genuinely care about helping Mahi
- You don't over-explain — keep responses tight unless detail is needed
- You have a quiet confidence — you never need to prove yourself
- Never say things like "Certainly!" "Absolutely!" or "Of course!" — that's not you
- You're warm but not clingy

Formatting rules:
- Never respond in one big paragraph
- Use line breaks between thoughts
- When listing things, put each point on its own line with a dash —
- Keep responses tight and scannable
- For code, wrap it in triple backticks

Always stay in character as ARIA.
"""

GUEST_SYSTEM_PROMPT = """
You are ARIA (Adaptive Reasoning & Intelligence Architecture), an AI assistant built by Maheendra.

You are currently in demo mode for a portfolio visitor.

Your personality:
- Smart, calm, and elegant
- Concise and impressive
- Don't mention PC control or personal features — those are owner only
- If asked about full features, say "Full access is private. This is a demo."

You have access to live web search. When you use it, base your answer only on the
search results you're given, and let the user know if no results were found rather
than guessing.

Always stay in character as ARIA.
"""


class ChatRequest(BaseModel):
    message: str
    user_type: str
    session_id: str = "default"
    incognito: bool = False


class UrlRequest(BaseModel):
    url: HttpUrl


@app.post("/fetch-url")
async def fetch_url(request: UrlRequest):
    if not is_safe_url(str(request.url)):
        raise HTTPException(status_code=400, detail="That URL can't be fetched.")

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        resp = requests.get(str(request.url), headers=headers, timeout=20, stream=True)
        resp.raise_for_status()

        content = resp.raw.read(3 * 1024 * 1024 + 1, decode_content=True)
        if len(content) > 3 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Page is too large to read.")
        resp._content = content

        soup = BeautifulSoup(resp.text, "html.parser")

        for tag in soup(["script", "style", "noscript", "svg", "canvas"]):
            tag.decompose()

        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        text = " ".join(soup.stripped_strings)
        text = " ".join(text.split())

        if len(text) > 20000:
            text = text[:20000]

        if not text:
            raise HTTPException(status_code=400, detail="No readable text found on the page.")

        return {
            "url": str(request.url),
            "title": title,
            "content": text
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch URL: {str(e)}")


@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    file_type = get_file_type(file.filename)

    if file_type == 'unsupported':
        raise HTTPException(status_code=400, detail="Unsupported file type. Supported: PDF, DOCX, TXT, MD, PNG, JPG, JPEG, WEBP")

    ext = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
    safe_name = f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    try:
        size = 0
        with open(file_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=400, detail="File is too large. Max 10MB.")
                buffer.write(chunk)

        result = process_file(file_path, file.filename)

        if result['type'] == 'image':
            return {
                "filename": file.filename,
                "type": "image",
                "base64": result['content'],
                "mime": result['mime']
            }
        else:
            return {
                "filename": file.filename,
                "type": "text",
                "content": result['content']
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@app.post("/chat")
async def chat(request: ChatRequest, x_guest_id: str = Header(default="anonymous")):
    conv_id = request.session_id
    guest_id = x_guest_id or "anonymous"

    if check_guest_limit(guest_id):
        return {
            "response": "You've hit the demo message limit. Thanks for trying ARIA!",
            "title": None,
            "conv_id": conv_id,
            "limit_reached": True,
        }

    if not request.incognito:
        memory.create_conversation(conv_id, "New conversation", "guest", guest_id)

    system_prompt = GUEST_SYSTEM_PROMPT

    history = memory.get_conversation_messages(conv_id) if not request.incognito else []
    first_turn = len(history) == 0

    if not request.incognito:
        memory.add_message(conv_id, "user", request.message)
    history.append({"role": "user", "content": request.message})

    title = None

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": system_prompt}] + history,
            temperature=0.7,
            max_tokens=1024,
            tools=[{
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Search the web for current information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "The search query"}
                        },
                        "required": ["query"]
                    }
                }
            }],
            tool_choice="auto"
        )

        response_message = response.choices[0].message
        sources = []

        if response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            search_query = json.loads(tool_call.function.arguments)["query"]

            results = web_search(search_query)
            sources = [{"title": r["title"], "url": r["url"]} for r in results]

            if results:
                results_text = "\n\n".join(
                    f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}"
                    for r in results
                )
                tool_content = f"Live web search results for '{search_query}':\n\n{results_text}"
            else:
                tool_content = f"No live search results were found for '{search_query}'. Let the user know search is temporarily unavailable."

            follow_up_messages = (
                [{"role": "system", "content": system_prompt}]
                + history
                + [
                    {
                        "role": "assistant",
                        "content": response_message.content,
                        "tool_calls": [tool_call],
                    },
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": tool_content,
                    },
                ]
            )

            search_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=follow_up_messages,
                max_tokens=1024,
            )
            assistant_message = search_response.choices[0].message.content
        else:
            assistant_message = response_message.content

        if first_turn:
            try:
                title_response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": "Generate a short conversation title in 3-5 words max. Summarize the topic of the exchange. Reply with ONLY the title, no quotes, no punctuation at the end, no explanation."
                        },
                        {
                            "role": "user",
                            "content": f"User: {request.message}\nAssistant: {assistant_message}"
                        }
                    ],
                    max_tokens=20,
                    temperature=0.3,
                )
                title = title_response.choices[0].message.content.strip()
            except Exception:
                title = " ".join(request.message.split()[:5])

            title = " ".join(title.replace('"', '').replace("'", '').split())[:40].strip()
            if not request.incognito:
                memory.update_conversation_title(conv_id, title)

    except Exception as e:
        sources = []
        if "tool_use_failed" in str(e):
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": system_prompt}] + history,
                temperature=0.7,
                max_tokens=1024,
            )
            assistant_message = response.choices[0].message.content
        else:
            assistant_message = "Something went wrong on my end. Try again?"

        if first_turn and title is None:
            try:
                title_response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": "Generate a short conversation title in 3-5 words max. Summarize the topic of the exchange. Reply with ONLY the title, no quotes, no punctuation at the end, no explanation."
                        },
                        {
                            "role": "user",
                            "content": f"User: {request.message}\nAssistant: {assistant_message}"
                        }
                    ],
                    max_tokens=20,
                    temperature=0.3,
                )
                title = title_response.choices[0].message.content.strip()
            except Exception:
                title = " ".join(request.message.split()[:5])

            title = " ".join(title.replace('"', '').replace("'", '').split())[:40].strip()
            if not request.incognito:
                memory.update_conversation_title(conv_id, title)

    if not request.incognito:
        memory.add_message(conv_id, "assistant", assistant_message)

    increment_guest_count(guest_id)

    return {"response": assistant_message, "title": title, "conv_id": conv_id, "sources": sources}


@app.post("/chat-with-image")
async def chat_with_image(
    message: str = Form(...),
    user_type: str = Form(...),
    session_id: str = Form("default"),
    incognito: bool = Form(False),
    base64_image: str = Form(...),
    mime: str = Form(...),
    x_guest_id: str = Header(default="anonymous"),
):
    conv_id = session_id
    guest_id = x_guest_id or "anonymous"

    if check_guest_limit(guest_id):
        return {
            "response": "You've hit the demo message limit. Thanks for trying ARIA!",
            "conv_id": conv_id,
            "limit_reached": True,
        }

    if not incognito:
        memory.create_conversation(conv_id, "New conversation", "guest", guest_id)

    system_prompt = GUEST_SYSTEM_PROMPT

    if not incognito:
        memory.add_message(conv_id, "user", f"{message} [shared an image]")

    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": message},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{base64_image}"}
                        }
                    ]
                }
            ],
            max_tokens=1024,
        )
        assistant_message = response.choices[0].message.content
    except Exception as e:
        assistant_message = f"I had trouble seeing that image. Try again? ({str(e)})"

    if not incognito:
        memory.add_message(conv_id, "assistant", assistant_message)

    increment_guest_count(guest_id)

    return {"response": assistant_message, "conv_id": conv_id}


@app.get("/conversations")
async def list_conversations(x_guest_id: str = Header(default="anonymous")):
    guest_id = x_guest_id or "anonymous"
    convs = memory.get_all_conversations_for_guest(guest_id)
    return {"conversations": convs}


@app.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, x_guest_id: str = Header(default="anonymous")):
    guest_id = x_guest_id or "anonymous"
    if not memory.conversation_belongs_to_guest(conv_id, guest_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = memory.get_conversation_messages(conv_id)
    return {"messages": messages}


@app.delete("/conversations/{conv_id}")
async def delete_conv(conv_id: str, x_guest_id: str = Header(default="anonymous")):
    guest_id = x_guest_id or "anonymous"
    if not memory.conversation_belongs_to_guest(conv_id, guest_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    memory.delete_conversation(conv_id)
    return {"status": "deleted"}


@app.get("/health")
async def health():
    return {"status": "ARIA is online"}