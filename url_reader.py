import re
import socket
import ipaddress
from urllib.parse import urlparse

import requests
import trafilatura
from bs4 import BeautifulSoup

URL_PATTERN = re.compile(r'https?://[^\s<>"\']+')

MAX_RESPONSE_BYTES = 3 * 1024 * 1024  # 3MB


def extract_urls(text):
    return URL_PATTERN.findall(text)


def is_safe_url(url):
    """Blocks localhost, private, link-local, and metadata addresses to prevent SSRF."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        if not parsed.hostname:
            return False

        hostname = parsed.hostname.lower()
        if hostname in ("localhost",):
            return False

        try:
            resolved_ips = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            return False

        for family, _, _, _, sockaddr in resolved_ips:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
            ):
                return False

        return True
    except Exception:
        return False


def fetch_page_text(url, max_chars=8000):
    if not is_safe_url(url):
        return None

    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(downloaded, include_comments=False, include_tables=True)
            if text and len(text.strip()) > 50:
                return text.strip()[:max_chars]
    except Exception:
        pass

    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=10, stream=True)

        content_length = response.headers.get('Content-Length')
        if content_length and int(content_length) > MAX_RESPONSE_BYTES:
            return None

        content = response.raw.read(MAX_RESPONSE_BYTES + 1, decode_content=True)
        if len(content) > MAX_RESPONSE_BYTES:
            return None

        soup = BeautifulSoup(content, 'html.parser')

        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()

        text = soup.get_text(separator='\n', strip=True)
        lines = [line for line in text.split('\n') if len(line.strip()) > 0]
        clean_text = '\n'.join(lines)

        if clean_text:
            return clean_text[:max_chars]
    except Exception:
        return None

    return None
