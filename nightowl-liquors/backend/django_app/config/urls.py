from django.contrib import admin
from django.urls import path, re_path

from .proxy import api_proxy
from .views import spa_index

urlpatterns = [
    path('admin/', admin.site.urls),
    # Proxy FastAPI public REST API through Django so the frontend can use /api/* on the same origin.
    path('api/<path:path>', api_proxy),

    # SPA: serve React app for any other route (client-side routing)
    re_path(r'^(?!api/|admin/).*$' , spa_index),
]


admin.site.site_header = 'Jhyaap Station Admin'
admin.site.site_title = 'Jhyaap Station'
admin.site.index_title = 'Operations Dashboard'

