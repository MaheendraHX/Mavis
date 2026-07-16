import os
import uuid
import traceback
import base64
import io

import requests
from bs4 import BeautifulSoup
from docx import Document as DocxDocument
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, HttpUrl
from groq import Groq
from dotenv import load_dotenv

import memory
from url_reader import is_safe_url
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
OWNER_PASSKEY = os.environ.get("OWNER_PASSKEY", "changeme")

# In-memory set of valid owner session tokens (reset on server restart — fine for demo)
_owner_sessions = set()

app = FastAPI()


def _generate_title(message: str, assistant_message: str) -> str:
    """Generate a short conversation title from the first exchange."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Generate a short conversation title in 3-5 words max. Summarize the topic of the exchange. Reply with ONLY the title, no quotes, no punctuation at the end, no explanation."
                },
                {
                    "role": "user",
                    "content": f"User: {message}\nAssistant: {assistant_message}"
                }
            ],
            max_tokens=20,
            temperature=0.3,
        )
        title = response.choices[0].message.content.strip()
    except Exception:
        title = " ".join(message.split()[:5])
    return " ".join(title.replace('"', '').replace("'", '').split())[:40].strip()

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "access-control-allow-origin": origin,
            "access-control-allow-credentials": "true",
            "access-control-allow-methods": "*",
            "access-control-allow-headers": "*",
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {type(exc).__name__}: {str(exc)}"},
        headers={
            "access-control-allow-origin": origin,
            "access-control-allow-credentials": "true",
            "access-control-allow-methods": "*",
            "access-control-allow-headers": "*",
        },
    )

# CORS headers — always added to every response via middleware
class ForceCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        if request.method == "OPTIONS":
            return JSONResponse(
                content="OK",
                status_code=200,
                headers={
                    "access-control-allow-origin": origin or "*",
                    "access-control-allow-credentials": "true",
                    "access-control-allow-methods": "*",
                    "access-control-allow-headers": "*",
                    "access-control-max-age": "600",
                },
            )
        response = await call_next(request)
        response.headers["access-control-allow-origin"] = origin or "*"
        response.headers["access-control-allow-credentials"] = "true"
        response.headers["access-control-allow-methods"] = "*"
        response.headers["access-control-allow-headers"] = "*"
        response.headers["access-control-max-age"] = "600"
        return response

app.add_middleware(ForceCORSMiddleware)  # CORS enabled for all origins - v2




GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY not set! Chat will fail with 500.")
client = Groq(api_key=GROQ_API_KEY)


def check_guest_limit(guest_id):
    count = _guest_message_counts.get(guest_id, 0)
    return count >= GUEST_MESSAGE_LIMIT


def increment_guest_count(guest_id):
    _guest_message_counts[guest_id] = _guest_message_counts.get(guest_id, 0) + 1


MAVIS_SYSTEM_PROMPT = """
You are MAVIS (Adaptive Reasoning & Intelligence Architecture), a personal AI assistant built by Maheendra.

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

File creation:
- When Mahi asks for a document, report, essay, code file, or any structured content, create a downloadable file
- Automatically choose the best format: Word (.docx) for documents/reports, PDF for formal docs, .py for Python code, .html for web pages, .md for markdown
- When creating a file, tell Mahi "I've created a file for you — click the download button below"
- Don't show the file content as plain text — only show the download button

Always stay in character as MAVIS.
"""

GUEST_SYSTEM_PROMPT = """
You are MAVIS (Adaptive Reasoning & Intelligence Architecture), an AI assistant built by Maheendra.

You are currently in demo mode for a portfolio visitor.

Your personality:
- Smart, calm, and elegant but natural — not robotic
- Talk like a real person, not a formal assistant
- Keep responses concise and impressive
- Don't mention PC control or personal features — those are owner only
- If asked about full features, say "Full access is private. This is a demo."

You have access to live web search. Use it for:
- Current events, news, or time-sensitive info
- Facts, stats, or anything that might have changed
- Questions like "who is", "when was", "what is", "latest", "recent"

DON'T use web search for:
- Simple greetings ("hi", "hello", "hey")
- Thanks or appreciation
- General chit-chat
- Questions that don't need current info

When you use web search, base your answer only on the search results you're given, and let the user know if no results were found rather than guessing.

Always stay in character as MAVIS.
"""


class ChatRequest(BaseModel):
    message: str
    user_type: str
    session_id: str = "default"
    incognito: bool = False
    web_search: bool = True


class UrlRequest(BaseModel):
    url: HttpUrl


class OwnerAuthRequest(BaseModel):
    passkey: str

class OwnerAuthResponse(BaseModel):
    authenticated: bool
    session_id: str

@app.post("/auth/owner", response_model=OwnerAuthResponse)
async def auth_owner(req: OwnerAuthRequest):
    """Validate owner passkey. Returns a session_id on success."""
    if req.passkey == OWNER_PASSKEY:
        session_id = f"owner_{uuid.uuid4().hex[:12]}"
        _owner_sessions.add(session_id)
        return OwnerAuthResponse(authenticated=True, session_id=session_id)
    raise HTTPException(status_code=403, detail="Invalid passkey")


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

        # Read up to 3MB of decoded content without touching internal resp._content
        raw_bytes = resp.raw.read(3 * 1024 * 1024 + 1, decode_content=True)
        if len(raw_bytes) > 3 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Page is too large to read.")
        page_html = raw_bytes.decode(resp.encoding or "utf-8", errors="ignore")

        soup = BeautifulSoup(page_html, "html.parser")

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
                "mime": result['metadata'].get('mime_type', 'image/png')
            }
        elif result['type'] == 'text':
            return {
                "filename": file.filename,
                "type": "text",
                "content": result['content']
            }
        else:
            return {
                "filename": file.filename,
                "type": "error",
                "content": result.get('content', 'Could not read file')
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
            "response": "You've hit the demo message limit. Thanks for trying MAVIS!",
            "title": None,
            "conv_id": conv_id,
            "limit_reached": True,
        }

    if not request.incognito:
        memory.create_conversation(conv_id, "New conversation", "guest", guest_id)

    # Determine user type: validate owner session server-side, don't trust client
    is_owner = request.session_id.startswith("owner_") and request.session_id in _owner_sessions

    if is_owner:
        system_prompt = MAVIS_SYSTEM_PROMPT
        if PC_CONTROL_ENABLED:
            system_prompt += "\n\nNote: PC control is enabled. You can execute commands on the owner's machine when asked."
    else:
        system_prompt = GUEST_SYSTEM_PROMPT

    history = memory.get_conversation_messages(conv_id) if not request.incognito else []
    first_turn = len(history) == 0

    if not request.incognito:
        memory.add_message(conv_id, "user", request.message)
    history.append({"role": "user", "content": request.message})

    title = None

    try:
        if request.web_search:
            search_results = web_search(request.message, max_results=8)
            sources = [{"title": r["title"], "url": r["url"]} for r in search_results]
            if search_results:
                results_text = "\n\n".join(
                    f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}"
                    for r in search_results
                )
                search_prompt = system_prompt + "\n\n[Live web results for the user's query: \"" + request.message + "\"]\n" + results_text + "\n[/End of web results]"
            else:
                sources = []
                search_prompt = system_prompt
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": search_prompt}] + history,
                temperature=0.7,
                max_tokens=1024,
            )
            assistant_message = response.choices[0].message.content
        else:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": system_prompt}] + history,
                temperature=0.7,
                max_tokens=1024,
            )
            assistant_message = response.choices[0].message.content
            sources = []

        if first_turn:
            title = _generate_title(request.message, assistant_message)
            if not request.incognito:
                memory.update_conversation_title(conv_id, title)

    except Exception:
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": system_prompt}] + history,
                temperature=0.7,
                max_tokens=1024,
            )
            assistant_message = response.choices[0].message.content
        except Exception:
            assistant_message = "Something went wrong on my end. Try again?"
        sources = []

        if first_turn and title is None:
            title = _generate_title(request.message, assistant_message)
            if not request.incognito:
                memory.update_conversation_title(conv_id, title)

    if not request.incognito:
        memory.add_message(conv_id, "assistant", assistant_message)

    increment_guest_count(guest_id)

    return {"response": assistant_message, "title": title, "conv_id": conv_id, "sources": sources}


class CreateFileRequest(BaseModel):
    content: str
    filename: str = "document"
    file_type: str = "docx"  # docx, txt, md, html

@app.post("/create-file")
async def create_file(req: CreateFileRequest):
    """Generate a downloadable file from content."""
    content = req.content
    filename = req.filename
    file_type = req.file_type

    if file_type == "docx":
        doc = DocxDocument()
        # Parse markdown-style formatting
        for line in content.split('\n'):
            if line.startswith('# '):
                doc.add_heading(line[2:], level=1)
            elif line.startswith('## '):
                doc.add_heading(line[3:], level=2)
            elif line.startswith('### '):
                doc.add_heading(line[4:], level=3)
            elif line.startswith('- '):
                doc.add_paragraph(line[2:], style='List Bullet')
            elif line.startswith('```'):
                pass  # skip code fence markers
            else:
                if line.strip():
                    doc.add_paragraph(line)
        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        base64_data = base64.b64encode(buf.read()).decode()
        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ext = "docx"
    elif file_type == "txt":
        base64_data = base64.b64encode(content.encode('utf-8')).decode()
        mime = "text/plain"
        ext = "txt"
    elif file_type == "md":
        base64_data = base64.b64encode(content.encode('utf-8')).decode()
        mime = "text/markdown"
        ext = "md"
    elif file_type == "html":
        base64_data = base64.b64encode(content.encode('utf-8')).decode()
        mime = "text/html"
        ext = "html"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_type}")

    return {
        "success": True,
        "filename": f"{filename}.{ext}",
        "base64": base64_data,
        "mime": mime,
    }


@app.post("/chat-with-file")
async def chat_with_file(
    message: str = Form(...),
    user_type: str = Form(...),
    session_id: str = Form("default"),
    incognito: bool = Form(False),
    filename: str = Form(...),
    file_content: str = Form(""),
    x_guest_id: str = Header(default="anonymous"),
):
    conv_id = session_id
    guest_id = x_guest_id or "anonymous"

    if check_guest_limit(guest_id):
        return {
            "response": "You've hit the demo message limit. Thanks for trying MAVIS!",
            "conv_id": conv_id,
            "limit_reached": True,
        }

    if not incognito:
        memory.create_conversation(conv_id, "New conversation", "guest", guest_id)

    # Use owner prompt for Maheendra, guest prompt for demo visitors
    if user_type == "owner":
        system_prompt = MAVIS_SYSTEM_PROMPT
        if PC_CONTROL_ENABLED:
            system_prompt += "\n\nNote: PC control is enabled. You can execute commands on the owner's machine when asked."
    else:
        system_prompt = GUEST_SYSTEM_PROMPT

    # Derive file type from filename extension
    file_ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "file"

    # Use the pre-read file content
    title = None
    first_turn = False
    if not incognito:
        first_turn = not memory.has_messages(conv_id)

    try:
        if file_content:
            if not incognito:
                memory.add_message(conv_id, "user", f"{message} [attached a {file_ext} file: {filename}]")

            history = memory.get_conversation_messages(conv_id) if not incognito else []
            # Replace the last user message (simplified DB version) with full content
            if history and history[-1]["role"] == "user":
                history[-1] = {"role": "user", "content": f"{message}\n\nFile content:\n{file_content}"}
            else:
                history.append({"role": "user", "content": f"{message}\n\nFile content:\n{file_content}"})

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": system_prompt}] + history,
                temperature=0.7,
                max_tokens=1024,
            )
            assistant_message = response.choices[0].message.content
        else:
            assistant_message = f"I had trouble reading that file. Please try again."

        if first_turn:
            title = _generate_title(message, assistant_message)
            if not incognito:
                memory.update_conversation_title(conv_id, title)

    except Exception as e:
        assistant_message = f"I had trouble reading that file. Try again? ({str(e)})"

    if not incognito:
        memory.add_message(conv_id, "assistant", assistant_message)

    increment_guest_count(guest_id)

    return {"response": assistant_message, "title": title, "conv_id": conv_id}


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
            "response": "You've hit the demo message limit. Thanks for trying MAVIS!",
            "conv_id": conv_id,
            "limit_reached": True,
        }

    if not incognito:
        memory.create_conversation(conv_id, "New conversation", "guest", guest_id)

    # Use owner prompt for Maheendra, guest prompt for demo visitors
    if user_type == "owner":
        system_prompt = MAVIS_SYSTEM_PROMPT
        if PC_CONTROL_ENABLED:
            system_prompt += "\n\nNote: PC control is enabled. You can execute commands on the owner's machine when asked."
    else:
        system_prompt = GUEST_SYSTEM_PROMPT

    if not incognito:
        memory.add_message(conv_id, "user", f"{message} [shared an image]")

    title = None
    first_turn = False
    if not incognito:
        first_turn = not memory.has_messages(conv_id)

    try:
        history = memory.get_conversation_messages(conv_id) if not incognito else []
        # Replace the last user message (simplified DB version) with full multimodal content
        image_content = {
            "role": "user",
            "content": [
                {"type": "text", "text": message},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime};base64,{base64_image}"}
                }
            ]
        }
        if history and history[-1]["role"] == "user":
            history[-1] = image_content
        else:
            history.append(image_content)

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{"role": "system", "content": system_prompt}] + history,
            max_tokens=1024,
        )
        assistant_message = response.choices[0].message.content

        if first_turn:
            title = _generate_title(message, assistant_message)
            if not incognito:
                memory.update_conversation_title(conv_id, title)
    except Exception as e:
        assistant_message = f"I had trouble seeing that image. Try again? ({str(e)})"

    if not incognito:
        memory.add_message(conv_id, "assistant", assistant_message)

    increment_guest_count(guest_id)

    return {"response": assistant_message, "title": title, "conv_id": conv_id}


@app.get("/conversations")
async def list_conversations(x_guest_id: str = Header(default="anonymous")):
    guest_id = x_guest_id or "anonymous"
    try:
        convs = memory.get_all_conversations_for_guest(guest_id)
        return {"conversations": convs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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