# order/actions/pay_service.py
from decimal import Decimal
from django.db import transaction, IntegrityError
from products.models import Product
from ..models import Order

FREE_SHIPPING_THRESHOLD = Decimal("49.00")


def compute_totals(order):
    # items total from lines
    items_total = sum((it.line_total for it in order.items.all()), Decimal("0.00"))
    # shipping = sum of product captured fee when added
    shipping_total = sum(
        (it.product_shipping_fee or Decimal("0.00") for it in order.items.all()),
        Decimal("0.00"),
    )
    if items_total >= FREE_SHIPPING_THRESHOLD:
        shipping_total = Decimal("0.00")
    grand_total = items_total + shipping_total
    return items_total, shipping_total, grand_total


def finalize_cart_payment(order_id):
    """
    Atomically checks stock and decrements it.
    Returns (order, totals).
    Raises IntegrityError on any stock/active failure (caller should refund Stripe).
    """
    cart = (
        Order.objects.filter(id=order_id, status="CART")
        .prefetch_related("items__product")
        .first()
    )
    if not cart or cart.items.count() == 0:
        raise IntegrityError("Cart is empty")

    items = list(cart.items.select_related("product").order_by("id"))
    product_ids = [it.product_id for it in items]

    with transaction.atomic():
        # lock products in bulk
        locked_products = {
            p.id: p
            for p in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        # validate all items first, then update
        products_to_update = []
        for it in items:
            p = locked_products[it.product_id]

            if not p.is_active or p.stock_quantity < it.quantity:
                raise IntegrityError(f"Insufficient stock for {p.name}")

            # prepare for bulk update
            p.stock_quantity -= it.quantity
            products_to_update.append(p)

        # single bulk update for all products
        if products_to_update:
            Product.objects.bulk_update(products_to_update, ["stock_quantity"])

        # compute totals and finalize cart
        _, _, grand_total = compute_totals(cart)
        cart.total = grand_total
        cart.save(update_fields=["total", "status", "updated_at"])

    return cart, grand_total
