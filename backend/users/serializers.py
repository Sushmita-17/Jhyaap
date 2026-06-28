from rest_framework import serializers
from .models import Customer, Professional

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'address', 'status', 'total_orders', 'total_spent', 'created_at', 'updated_at']

class ProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = ['id', 'name', 'email', 'phone', 'role', 'location', 'status', 'joined_date', 'created_at', 'updated_at']
