from django.db import models
from django.contrib.auth.models import User
from order.actions.pay_service import compute_totals


# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    class Meta:
        ordering = ["-created_at"]

    def cleanup_out_of_stock_items_in_cart(self):
        from django.apps import apps

        Order = apps.get_model("order", "Order")
        cart = Order.objects.get(user=self.user, status="CART")
        for item in cart.items.all():
            if (
                not item.product.is_active
                or item.quantity > item.product.stock_quantity
            ):
                item.delete()
        # recompute totals
        compute_totals(cart)
