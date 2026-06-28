from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, ProfessionalViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'professionals', ProfessionalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
