from django.contrib import admin

from .models import Customer, DeliveryStaff, OTPVerification, RefreshToken, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'email', 'role', 'is_active', 'is_staff', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('phone', 'email')
    ordering = ('-created_at',)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'referral_code', 'wallet_balance', 'created_at')
    search_fields = ('name', 'user__phone', 'referral_code')


@admin.register(DeliveryStaff)
class DeliveryStaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'status', 'active_orders')
    list_filter = ('status',)
    search_fields = ('name', 'phone')


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ('phone', 'code', 'attempts', 'is_verified', 'expires_at', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('phone',)


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'expires_at', 'revoked', 'created_at')
    list_filter = ('revoked',)
