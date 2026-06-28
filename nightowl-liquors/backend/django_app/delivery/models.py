import uuid

from django.db import models

from accounts.models import Customer


class DeliveryZone(models.Model):
    class ZoneCode(models.TextChoices):
        A = 'A', 'Zone A — Core'
        B = 'B', 'Zone B — Mid'
        C = 'C', 'Zone C — Outer'
        D = 'D', 'Zone D — Extended'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=1, choices=ZoneCode.choices)
    name = models.CharField(max_length=100)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2)
    eta_minutes_min = models.PositiveIntegerField(default=30)
    eta_minutes_max = models.PositiveIntegerField(default=45)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'delivery_zones'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.name} (Rs {self.delivery_fee})'


class DeliveryArea(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    zone = models.ForeignKey(DeliveryZone, on_delete=models.PROTECT, related_name='areas')
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2)
    eta_minutes = models.PositiveIntegerField(default=45)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'delivery_areas'
        ordering = ['zone__sort_order', 'name']

    def __str__(self):
        return self.name


class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50)
    area = models.ForeignKey(DeliveryArea, on_delete=models.PROTECT, related_name='addresses')
    street = models.CharField(max_length=255)
    landmark = models.CharField(max_length=255, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'addresses'
        verbose_name_plural = 'Addresses'

    def __str__(self):
        return f'{self.label} — {self.street}, {self.area.name}'
