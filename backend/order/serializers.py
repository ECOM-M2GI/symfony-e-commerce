# order/serializers.py
from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem

# Free shipping threshold (change if you want; or move to settings)
FREE_SHIPPING_THRESHOLD = Decimal("49.00")


class OrderItemUpsertSerializer(serializers.Serializer):
    product = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    condition = serializers.CharField(source="product.condition", read_only=True)
    product_image_url = serializers.ImageField(required=True)
    current_stock = serializers.IntegerField(
        source="product.stock_quantity", read_only=True
    )

    seller_id = serializers.IntegerField(read_only=True)
    seller_username = serializers.CharField(read_only=True)
    product_shipping_fee = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True, allow_null=True
    )
    product_category = serializers.CharField(read_only=True)  # <-- add this
    delivery_mode = serializers.CharField(
        source="product.delivery_mode", read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "product_id",
            "product_name",
            "condition",
            "product_image_url",
            "unit_price",
            "quantity",
            "line_total",
            "current_stock",
            "seller_id",
            "seller_username",
            "product_shipping_fee",
            "product_category",
            "delivery_mode",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    shipping_total = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()
    free_shipping_threshold = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total",  # kept as stored items subtotal
            "subtotal",  # computed items subtotal (should match total)
            "shipping_total",  # computed shipping (0 if subtotal >= threshold)
            "grand_total",  # subtotal + shipping
            "free_shipping_threshold",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = [
            "id",
            "status",
            "total",
            "created_at",
            "updated_at",
            "subtotal",
            "shipping_total",
            "grand_total",
            "free_shipping_threshold",
        ]

    # ---- Computed fields ----
    def _calc_subtotal(self, obj: Order) -> Decimal:
        # Sum line_total over all items
        return sum((i.line_total for i in obj.items.all()), Decimal("0.00"))

    def get_subtotal(self, obj: Order) -> str:
        return f"{self._calc_subtotal(obj):.2f}"

    def get_shipping_total(self, obj: Order) -> str:
        subtotal = self._calc_subtotal(obj)
        if subtotal >= FREE_SHIPPING_THRESHOLD:
            return "0.00"
        shipping = sum(
            (
                (i.product_shipping_fee or Decimal("0.00")) * i.quantity
                for i in obj.items.all()
            ),
            Decimal("0.00"),
        )
        return f"{shipping:.2f}"

    def get_grand_total(self, obj: Order) -> str:
        subtotal = self._calc_subtotal(obj)
        shipping = Decimal(self.get_shipping_total(obj))
        return f"{(subtotal + shipping):.2f}"

    def get_free_shipping_threshold(self, obj: Order) -> str:
        return f"{FREE_SHIPPING_THRESHOLD:.2f}"
