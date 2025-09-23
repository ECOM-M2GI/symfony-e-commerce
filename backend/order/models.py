import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator

User = settings.AUTH_USER_MODEL


class Order(models.Model):
    STATUS = (
        ("CART", "Cart"),
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("SHIPPED", "Shipped"),
        ("CANCELED", "Canceled"),
        ("COMPLETED", "Completed"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=10, choices=STATUS, default="CART")
    total = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "products.Product", on_delete=models.PROTECT, related_name="+"
    )  # Use string reference instead of direct import
    product_name = models.CharField(max_length=200)
    product_image_url = models.ImageField()
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))]
    )
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))]
    )
    seller_id = models.IntegerField(null=True, blank=True)
    seller_username = models.CharField(max_length=150, blank=True)

    # the shipping fee of the product at the time it was added
    product_shipping_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        default=None,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    product_category = models.CharField(max_length=20, blank=True)

    class Meta:
        unique_together = ("order", "product")
