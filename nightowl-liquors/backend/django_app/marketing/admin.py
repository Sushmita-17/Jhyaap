from django.contrib import admin

from .models import Banner, Offer, Referral, Review


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'priority', 'is_active', 'start_at', 'end_at')
    list_filter = ('type', 'is_active')
    search_fields = ('title',)


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'value', 'status', 'start_at', 'end_at')
    list_filter = ('type', 'status')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'customer', 'rating', 'approved', 'created_at')
    list_filter = ('approved', 'rating')
    search_fields = ('product__name', 'customer__name', 'comment')
    list_editable = ('approved',)


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referrer', 'referred', 'status', 'reward_amount', 'created_at')
    list_filter = ('status',)
