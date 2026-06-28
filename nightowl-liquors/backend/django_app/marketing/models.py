import uuid

from django.db import models

from accounts.models import Customer
from catalog.models import Product
from orders.models import Order


class Banner(models.Model):
    class BannerType(models.TextChoices):
        HERO = 'hero', 'Hero'
        PROMO = 'promo', 'Promo'
        SIDEBAR = 'sidebar', 'Sidebar'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=BannerType.choices, default=BannerType.HERO)
    image = models.URLField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    button_text = models.CharField(max_length=50, blank=True)
    button_link = models.CharField(max_length=255, blank=True)
    tag = models.CharField(max_length=50, blank=True)
    priority = models.PositiveIntegerField(default=0)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'banners'
        ordering = ['priority']

    def __str__(self):
        return self.title


class Offer(models.Model):
    class OfferType(models.TextChoices):
        PERCENTAGE = 'percentage', 'Percentage'
        FLAT = 'flat', 'Flat'
        BUNDLE = 'bundle', 'Bundle'
        BXGY = 'bxgy', 'Buy X Get Y'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        EXPIRED = 'expired', 'Expired'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=OfferType.choices)
    title = models.CharField(max_length=200)
    banner = models.URLField(blank=True)
    discount_type = models.CharField(max_length=20, blank=True)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    product_ids = models.JSONField(default=list, blank=True)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    class Meta:
        db_table = 'offers'

    def __str__(self):
        return self.title


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey(Order, null=True, blank=True, on_delete=models.SET_NULL)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    photos = models.JSONField(default=list, blank=True)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.product.name} — {self.rating}★'


class Referral(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        REWARDED = 'rewarded', 'Rewarded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='referrals_made')
    referred = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='referrals_received')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'referrals'
