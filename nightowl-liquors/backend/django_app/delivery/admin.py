from django.contrib import admin

from .models import Address, DeliveryArea, DeliveryZone


class DeliveryAreaInline(admin.TabularInline):
    model = DeliveryArea
    extra = 1


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'delivery_fee', 'eta_minutes_min', 'eta_minutes_max', 'is_active')
    inlines = [DeliveryAreaInline]


@admin.register(DeliveryArea)
class DeliveryAreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'zone', 'delivery_fee', 'eta_minutes', 'is_active')
    list_filter = ('zone', 'is_active')
    search_fields = ('name',)


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('label', 'customer', 'area', 'street', 'is_default')
    search_fields = ('customer__name', 'street', 'area__name')
