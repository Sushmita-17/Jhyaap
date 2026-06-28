from __future__ import annotations

import os
from typing import Any

import requests
from django.http import HttpRequest, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.generic import View


def _get_fastapi_base_url() -> str:
    # Allow both env var and settings override.
    return os.getenv('FASTAPI_BASE_URL', 'http://localhost:8000/api').rstrip('/')


class ApiProxyView(View):
    """Proxy /api/* requests to FastAPI.

    This keeps the frontend contract stable while Django remains the main origin.
    """

    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']

    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:  # type: ignore[override]
        path = kwargs.get('path', '')
        fastapi_base = _get_fastapi_base_url()

        # FastAPI receives paths starting with /api
        target_url = f"{fastapi_base}/{path}" if path else f"{fastapi_base}"

        # Forward query params
        params = request.GET if request.method.upper() in {'GET', 'DELETE'} else None

        # Forward headers (drop hop-by-hop headers)
        hop_by_hop = {
            'connection',
            'keep-alive',
            'proxy-authenticate',
            'proxy-authorization',
            'te',
            'trailers',
            'transfer-encoding',
            'upgrade',
        }
        headers: dict[str, str] = {}
        for k, v in request.headers.items():
            lk = k.lower()
            if lk in hop_by_hop:
                continue
            # requests will set Content-Type if json/data is provided
            headers[k] = v

        # Cookies: forward all; FastAPI will read HttpOnly refresh cookie on /api/auth/refresh
        cookies = request.COOKIES

        body = request.body or b''

        # If content-type is json, forward as json; else forward raw body.
        content_type = request.headers.get('content-type', '')
        is_json = 'application/json' in content_type

        try:
            resp = requests.request(
                method=request.method,
                url=target_url,
                params=params,
                headers=headers,
                cookies=cookies,
                data=None if is_json else body,
                json=None if not is_json else (request.POST.dict() if not body else None),
                allow_redirects=False,
                timeout=30,
            )
        except requests.RequestException as e:
            return HttpResponse(
                content=f'FastAPI proxy error: {type(e).__name__}: {e}',
                status=502,
            )

        # Build Django response
        django_resp = HttpResponse(
            content=resp.content,
            status=resp.status_code,
        )

        # Copy headers
        for k, v in resp.headers.items():
            # Django disallows some headers
            if k.lower() in {'content-encoding', 'transfer-encoding', 'connection'}:
                continue
            django_resp[k] = v

        return django_resp


@require_http_methods(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'])
def api_proxy(request: HttpRequest, path: str) -> HttpResponse:
    # Functional wrapper for simpler URL conf usage
    view = ApiProxyView.as_view()
    return view(request, path=path)

