import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


class Product(models.Model):
    DELIVERY_MODES = [
        ("hand_to_hand", "Main propre"),
        ("by_mail", "Poste"),
    ]
    CATEGORIES = [
        ("clothes", "Vêtements"),
        ("books", "Livres"),
        ("cars", "Voitures"),
        ("video_games", "Jeux-vidéos"),
        ("sport", "Sport"),
        ("home", "Maison"),
        ("appliances", "Électroménager"),
    ]
    CONDITIONS = [
        ("new", "Neuf"),
        ("like_new", "Presque neuf"),
        ("good", "Bon"),
        ("acceptable", "Acceptable"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))]
    )
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)

    shipping_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        default=None,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    delivery_mode = models.CharField(
        max_length=20, choices=DELIVERY_MODES, default="by_mail"
    )
    category = models.CharField(max_length=20, choices=CATEGORIES, default="home")
    condition = models.CharField(max_length=20, choices=CONDITIONS, default="good")

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image_url = models.ImageField(upload_to="images/products/")

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-created_at"]

    @property
    def times_ordered(self):
        from django.apps import apps

        OrderItem = apps.get_model("order", "OrderItem")
        return (
            OrderItem.objects.filter(product=self).aggregate(models.Sum("quantity"))[
                "quantity__sum"
            ]
            or 0
        )

    @property
    def is_in_at_leat_one_paid_order(self):
        from django.apps import apps

        OrderItem = apps.get_model("order", "OrderItem")
        return OrderItem.objects.filter(product=self, order__status="PAID").exists()

    def remove_from_carts(self):
        from django.apps import apps

        OrderItem = apps.get_model("order", "OrderItem")
        OrderItem.objects.filter(product=self, order__status="CART").delete()

    def deactivate(self):
        self.is_active = False
        self.remove_from_carts()
        self.save(update_fields=["is_active"])

    def set_out_of_stock(self):
        self.stock_quantity = 0
        self.save(update_fields=["stock_quantity"])

    def delete_p(self):
        if self.is_in_at_leat_one_paid_order:
            self.deactivate()
            self.set_out_of_stock()
        else:
            self.remove_from_carts()
            super().delete()
