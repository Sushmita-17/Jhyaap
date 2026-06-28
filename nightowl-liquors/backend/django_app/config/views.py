from __future__ import annotations

import os
from pathlib import Path

from django.http import Http404, HttpRequest, HttpResponse
from django.views.decorators.http import require_http_methods


def _dist_index_path() -> Path:
    # repo_root/dist/index.html (this repo has dist/ at the root)
    return Path(__file__).resolve().parents[3] / 'dist' / 'index.html'


@require_http_methods(["GET", "HEAD"])
def spa_index(request: HttpRequest) -> HttpResponse:
    """Serve React SPA entry point for any non-API/non-admin path."""
    index_path = _dist_index_path()
    if not index_path.exists():
        raise Http404('SPA index.html not found')

    # Send file without template rendering
    content = index_path.read_bytes()
    resp = HttpResponse(content=content, content_type='text/html; charset=utf-8')
    return resp

