import json
import secrets
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from catalog.models import Brand, Category, Product
from delivery.models import DeliveryArea, DeliveryZone
from orders.models import Coupon

User = get_user_model()

DELIVERY_ZONES = [
    {
        'code': 'A',
        'name': 'Zone A — Core',
        'delivery_fee': 80,
        'eta_minutes_min': 30,
        'eta_minutes_max': 45,
        'areas': ['Thamel', 'New Baneshwor', 'Putalisadak', 'Durbarmarg'],
    },
    {
        'code': 'B',
        'name': 'Zone B — Mid',
        'delivery_fee': 100,
        'eta_minutes_min': 45,
        'eta_minutes_max': 60,
        'areas': ['Lazimpat', 'Baluwatar', 'Maharajgunj', 'Naxal', 'Sinamangal'],
    },
    {
        'code': 'C',
        'name': 'Zone C — Outer',
        'delivery_fee': 120,
        'eta_minutes_min': 60,
        'eta_minutes_max': 90,
        'areas': ['Koteshwor', 'Satdobato', 'Tikathali', 'Budhanilkantha'],
    },
    {
        'code': 'D',
        'name': 'Zone D — Extended',
        'delivery_fee': 150,
        'eta_minutes_min': 90,
        'eta_minutes_max': 120,
        'areas': ['Bhaktapur', 'Lalitpur Core', 'Patan', 'Kirtipur'],
    },
]

DEFAULT_COUPONS = [
    {'code': 'JHYAAP20', 'type': 'percentage', 'value': 20, 'min_order': 500},
    {'code': 'FIRST100', 'type': 'flat', 'value': 100, 'min_order': 0},
    {'code': 'DELIVERY50', 'type': 'percentage', 'value': 50, 'min_order': 1000},
]


class Command(BaseCommand):
    help = 'Seed delivery zones, categories, brands, products, coupons, and admin user'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Seeding Jhyaap Station baseline data...')
        self._seed_admin()
        self._seed_delivery()
        self._seed_catalog()
        self._seed_coupons()
        self.stdout.write(self.style.SUCCESS('Seed complete.'))

    def _seed_admin(self):
        phone = '9801001101'
        if not User.objects.filter(phone=phone).exists():
            User.objects.create_superuser(
                phone=phone,
                password='admin123',
                email='admin@jhyaapstation.com',
            )
            self.stdout.write(f'  Created superuser phone={phone} password=admin123')

    def _seed_delivery(self):
        for idx, zone_data in enumerate(DELIVERY_ZONES):
            zone, _ = DeliveryZone.objects.update_or_create(
                code=zone_data['code'],
                defaults={
                    'name': zone_data['name'],
                    'delivery_fee': zone_data['delivery_fee'],
                    'eta_minutes_min': zone_data['eta_minutes_min'],
                    'eta_minutes_max': zone_data['eta_minutes_max'],
                    'sort_order': idx,
                    'is_active': True,
                },
            )
            for area_name in zone_data['areas']:
                DeliveryArea.objects.update_or_create(
                    name=area_name,
                    defaults={
                        'zone': zone,
                        'delivery_fee': zone_data['delivery_fee'],
                        'eta_minutes': zone_data['eta_minutes_max'],
                        'is_active': True,
                    },
                )
        self.stdout.write(f'  Delivery zones: {DeliveryZone.objects.count()}, areas: {DeliveryArea.objects.count()}')

    def _seed_catalog(self):
        seed_path = Path(__file__).resolve().parents[2] / 'seed' / 'catalog.json'
        if not seed_path.exists():
            self.stdout.write(self.style.WARNING(f'  No catalog.json at {seed_path}'))
            return

        data = json.loads(seed_path.read_text(encoding='utf-8'))
        brand_cache: dict[str, Brand] = {}
        category_cache: dict[str, Category] = {}

        for idx, cat in enumerate(data.get('categories', [])):
            category, _ = Category.objects.update_or_create(
                slug=cat['id'],
                defaults={
                    'name': cat['name'],
                    'icon': cat.get('icon', ''),
                    'color': cat.get('color', ''),
                    'image': cat.get('image', ''),
                    'sort_order': idx,
                    'is_active': True,
                },
            )
            category_cache[cat['id']] = category

        for product in data.get('products', []):
            brand_name = product['brand']
            if brand_name not in brand_cache:
                brand, _ = Brand.objects.update_or_create(
                    slug=slugify(brand_name),
                    defaults={'name': brand_name, 'is_active': True},
                )
                brand_cache[brand_name] = brand

            category = category_cache.get(product['category'])
            if not category:
                continue

            slug_base = slugify(product['name'])
            Product.objects.update_or_create(
                legacy_id=product['legacy_id'],
                defaults={
                    'name': product['name'],
                    'slug': slug_base,
                    'description': product.get('description', ''),
                    'price': Decimal(str(product['price'])),
                    'discount_price': Decimal(str(product['discount_price'])) if product.get('discount_price') else None,
                    'category': category,
                    'brand': brand_cache[brand_name],
                    'subcategory': product.get('subcategory', ''),
                    'stock': product.get('stock', 0),
                    'volume': product.get('volume', ''),
                    'abv': product.get('abv', ''),
                    'images': product.get('images', [product.get('image', '')]),
                    'tags': product.get('tags', []),
                    'badge': product.get('badge', ''),
                    'rating': Decimal(str(product.get('rating', 0))),
                    'review_count': product.get('review_count', 0),
                    'popularity': product.get('popularity', 0),
                    'status': Product.Status.ACTIVE if product.get('stock', 0) > 0 else Product.Status.OUT_OF_STOCK,
                },
            )

        self.stdout.write(
            f'  Catalog: {Category.objects.count()} categories, '
            f'{Brand.objects.count()} brands, {Product.objects.count()} products'
        )

    def _seed_coupons(self):
        for coupon in DEFAULT_COUPONS:
            Coupon.objects.update_or_create(
                code=coupon['code'],
                defaults={
                    'type': coupon['type'],
                    'value': Decimal(str(coupon['value'])),
                    'min_order': Decimal(str(coupon['min_order'])),
                    'is_active': True,
                },
            )
        self.stdout.write(f'  Coupons: {Coupon.objects.count()}')
