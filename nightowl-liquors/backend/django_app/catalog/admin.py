from django.contrib import admin

from .models import Brand, Category, Product, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'sort_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    list_filter = ('is_active',)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'country_of_origin', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'discount_price', 'stock', 'status', 'popularity')
    list_filter = ('status', 'category', 'brand')
    search_fields = ('name', 'legacy_id', 'brand__name')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline]
    list_editable = ('stock', 'status', 'price', 'discount_price')


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'sku', 'price', 'stock', 'is_active')
    search_fields = ('sku', 'product__name')
