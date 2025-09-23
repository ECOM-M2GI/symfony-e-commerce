from rest_framework import serializers
from ..models import Product

ORDERING_CHOICES = [
    ("-created_at", "Newest"),
    ("created_at", "Oldest"),
    ("-price", "Price: high to low"),
    ("price", "Price: low to high"),
    ("name", "Name A to Z"),
    ("-name", "Name Z to A"),
    ("stock_quantity", "Stock haut"),
    ("-stock_quantity", "Stock bas"),
]


class ProductListQuerySerializer(serializers.Serializer):
    # allow_blank=True so Swagger’s “Send empty value” won’t 400
    category = serializers.ChoiceField(
        choices=Product.CATEGORIES, required=False, allow_blank=True
    )
    delivery_mode = serializers.ChoiceField(
        choices=Product.DELIVERY_MODES, required=False, allow_blank=True
    )
    condition = serializers.ChoiceField(
        choices=Product.CONDITIONS, required=False, allow_blank=True
    )

    name = serializers.CharField(required=False, allow_blank=True, trim_whitespace=True)
    price_min = serializers.DecimalField(
        required=False, max_digits=10, decimal_places=2
    )
    price_max = serializers.DecimalField(
        required=False, max_digits=10, decimal_places=2
    )
    in_stock = serializers.BooleanField(required=False)
    seller_id = serializers.IntegerField(required=False, min_value=1)
    ordering = serializers.ChoiceField(
        choices=ORDERING_CHOICES, required=False, allow_blank=True
    )
    popular = serializers.IntegerField(required=False, min_value=0)
