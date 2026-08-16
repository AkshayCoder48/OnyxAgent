"""
Cloudflare Proxy Client for OnyxAgent

Routes outbound HTTP requests through a Cloudflare Worker proxy so that
HuggingFace's servers only see traffic to *.workers.dev — they can't see
what the agent is actually doing (API calls, web scraping, browser automation).

This solves:
  - G4F 403 "cloud provider blocked" error
  - Web scraping without HF seeing target URLs
  - API calls to providers that block cloud IPs
  - Playwright/browser automation

Configuration (in config.json or env vars):
  cloudflare_proxy_url = https://your-worker.your-subdomain.workers.dev
  cloudflare_proxy_key = your-secret-key (optional, must match PROXY_KEY on the worker)

Usage:
  from common.cloudflare_proxy import proxied_request, get_proxied_url

  # Make a request through the proxy
  resp = proxied_request('https://api.openai.com/v1/chat/completions', json={...})

  # Get a proxied URL (for libraries that need a URL instead of making the request)
  url = get_proxied_url('https://api.openai.com/v1/chat/completions')
"""

import os
import threading
from typing import Dict, Optional
from urllib.parse import urlparse, quote

import requests

from common.log import logger


# ─── Configuration ───────────────────────────────────────────────────────

_proxy_url: Optional[str] = None
_proxy_key: Optional[str] = None
_enabled: bool = False
_lock = threading.Lock()


def configure_proxy(url: str = None, key: str = None):
    """Configure the Cloudflare proxy. Call once at startup.

    Reads from config.json if url/key not provided.
    """
    global _proxy_url, _proxy_key, _enabled

    with _lock:
        if url is None or key is None:
            try:
                from config import conf
                url = url or conf().get("cloudflare_proxy_url", "")
                key = key or conf().get("cloudflare_proxy_key", "")
            except Exception:
                pass

        # Also check env vars (for HF Spaces)
        url = url or os.environ.get("CLOUDFLARE_PROXY_URL", "")
        key = key or os.environ.get("CLOUDFLARE_PROXY_KEY", "")

        _proxy_url = url.rstrip("/") if url else None
        _proxy_key = key or None
        _enabled = bool(_proxy_url)

        if _enabled:
            logger.info(f"[CloudflareProxy] Enabled — routing through {_proxy_url}")
        else:
            logger.debug("[CloudflareProxy] Disabled (no proxy URL configured)")


def is_enabled() -> bool:
    """Check if the proxy is enabled."""
    return _enabled


def get_proxied_url(original_url: str) -> str:
    """Convert a regular URL to a proxied URL.

    Example:
      https://api.openai.com/v1/chat/completions
      → https://worker.dev/proxy/api.openai.com/v1/chat/completions?key=xxx
    """
    if not _enabled or not _proxy_url:
        return original_url

    parsed = urlparse(original_url)
    host = parsed.hostname
    path = parsed.path or "/"
    query = parsed.query

    # Build proxied URL
    proxied = f"{_proxy_url}/proxy/{host}{path}"
    if query:
        proxied += f"?{query}"

    # Add proxy key as query param if set (for libraries that don't support custom headers)
    if _proxy_key:
        separator = "&" if "?" in proxied else "?"
        proxied += f"{separator}key={quote(_proxy_key)}"

    return proxied


def proxied_request(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    json: Optional[dict] = None,
    data: Optional[bytes] = None,
    timeout: int = 30,
    stream: bool = False,
    **kwargs,
) -> requests.Response:
    """Make an HTTP request through the Cloudflare proxy.

    This is a drop-in replacement for requests.request() that automatically
    routes through the proxy when enabled.
    """
    if not _enabled or not _proxy_url:
        # Proxy disabled — make direct request
        return requests.request(
            method=method,
            url=url,
            headers=headers,
            json=json,
            data=data,
            timeout=timeout,
            stream=stream,
            **kwargs,
        )

    # Build proxied URL
    proxied_url = get_proxied_url(url)

    # Add proxy key header
    proxy_headers = dict(headers) if headers else {}
    if _proxy_key:
        proxy_headers["X-Proxy-Key"] = _proxy_key

    # Remove Host header (the worker sets it)
    proxy_headers.pop("Host", None)

    logger.debug(f"[CloudflareProxy] {method} {urlparse(url).hostname} → proxy")

    return requests.request(
        method=method,
        url=proxied_url,
        headers=proxy_headers,
        json=json,
        data=data,
        timeout=timeout,
        stream=stream,
        **kwargs,
    )


def proxied_get(url: str, **kwargs) -> requests.Response:
    """GET request through proxy."""
    return proxied_request(url, method="GET", **kwargs)


def proxied_post(url: str, **kwargs) -> requests.Response:
    """POST request through proxy."""
    return proxied_request(url, method="POST", **kwargs)


# ─── Integration with OpenAI HTTP client ─────────────────────────────────

def patch_http_client():
    """Patch the OpenAIHTTPClient to route requests through the proxy.

    This is called automatically at startup when the proxy is enabled.
    It monkey-patches the _request method to use proxied_request instead
    of requests.post directly.
    """
    if not _enabled:
        return

    try:
        from models.openai.openai_http_client import OpenAIHTTPClient

        original_request = OpenAIHTTPClient._request

        def patched_request(self, *, path, payload, api_key, api_base, timeout,
                           stream, proxy=None, extra_headers=None,
                           extra_query=None):
            """Route the request through the Cloudflare proxy."""
            base = (api_base or self.api_base).rstrip("/") if api_base else self.api_base
            original_url = f"{base}{path}" if path.startswith("/") else f"{base}/{path}"

            proxied_url = get_proxied_url(original_url)

            # Build headers
            key = api_key if api_key is not None else self.api_key
            req_headers = {"Content-Type": "application/json"}
            if key:
                req_headers["Authorization"] = f"Bearer {key}"
            if _proxy_key:
                req_headers["X-Proxy-Key"] = _proxy_key
            if self.extra_headers:
                req_headers.update(self.extra_headers)
            if extra_headers:
                req_headers.update(extra_headers)

            # Add attribution headers
            from models.openai.openai_http_client import _resolve_attribution_headers
            attribution = _resolve_attribution_headers(original_url)
            if attribution:
                req_headers.update(attribution)

            req_timeout = timeout if timeout is not None else self.timeout
            proxies = ({"http": proxy, "https": proxy} if proxy else self.proxies)
            clean_payload = {k: v for k, v in payload.items() if v is not None}

            if stream:
                return self._stream_chat(
                    url=proxied_url,
                    headers=req_headers,
                    payload=clean_payload,
                    proxies=proxies,
                    timeout=req_timeout,
                    params=extra_query,
                    retry_without_key=False,
                    original_api_key=api_key,
                    original_extra_headers=extra_headers,
                )

            try:
                resp = requests.post(
                    proxied_url,
                    headers=req_headers,
                    json=clean_payload,
                    timeout=req_timeout,
                    proxies=proxies,
                    params=extra_query,
                )
            except requests.exceptions.Timeout as e:
                from models.openai.openai_http_client import OpenAIHTTPError
                raise OpenAIHTTPError(408, {}, f"Request timed out: {e}")
            except requests.exceptions.ConnectionError as e:
                from models.openai.openai_http_client import OpenAIHTTPError
                raise OpenAIHTTPError(0, {}, f"Connection error: {e}")
            except requests.exceptions.RequestException as e:
                from models.openai.openai_http_client import OpenAIHTTPError
                raise OpenAIHTTPError(0, {}, f"Request failed: {e}")

            return self._parse_response(resp)

        OpenAIHTTPClient._request = patched_request
        logger.info("[CloudflareProxy] Patched OpenAIHTTPClient to route through proxy")

    except ImportError:
        logger.warning("[CloudflareProxy] Could not patch OpenAIHTTPClient (not imported yet)")
    except Exception as e:
        logger.error(f"[CloudflareProxy] Failed to patch HTTP client: {e}")


# ─── Auto-configure on import ────────────────────────────────────────────

def _auto_configure():
    """Auto-configure the proxy from env vars on first import."""
    try:
        configure_proxy()
        if _enabled:
            patch_http_client()
    except Exception as e:
        logger.debug(f"[CloudflareProxy] Auto-configure failed: {e}")


# Run auto-configure when this module is imported
_auto_configure()
