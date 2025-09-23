from decimal import InvalidOperation
from rest_framework import serializers
from .models import Product


class ProductBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock_quantity",
            "is_active",
            "shipping_fee",
            "delivery_mode",
            "category",
            "condition",
            "image_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_price(self, value):
        try:
            if value < 0:
                raise serializers.ValidationError("Le prix doit être >= 0")
        except (TypeError, InvalidOperation):
            raise serializers.ValidationError(
                "Le prix doit être un nombre décimal valide."
            )
        return value

    def validate_shipping_fee(self, value):
        try:
            if value < 0:
                raise serializers.ValidationError(
                    "Les frais de livraison doivent être >= 0."
                )
        except (TypeError, InvalidOperation):
            raise serializers.ValidationError(
                "Les frais de livraison doivent être un nombre décimal valide."
            )
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif.")
        return value

    def validate(self, attrs):
        delivery_mode = attrs.get("delivery_mode") or getattr(
            self.instance, "delivery_mode", None
        )
        if delivery_mode == "hand_to_hand":
            attrs["shipping_fee"] = None
        return attrs


class ProductCreateSerializer(ProductBaseSerializer):
    pass


class ProductUpdateSerializer(ProductBaseSerializer):
    pass


class ProductListSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )
    image_url = serializers.ImageField(required=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock_quantity",
            "is_active",
            "shipping_fee",
            "delivery_mode",
            "category",
            "condition",
            "image_url",
            "created_at",
            "updated_at",
            "created_by_username",
        ]
        read_only_fields = fields
