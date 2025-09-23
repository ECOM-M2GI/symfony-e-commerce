from ..models import Order


def get_or_create_cart_order(user):
    cart, _ = Order.objects.get_or_create(user=user, status="CART")
    return cart


def get_cart_with_products(user):
    """Get cart with optimized product data fetching"""
    cart, _ = (
        Order.objects.select_related()
        .prefetch_related("items__product")
        .get_or_create(user=user, status="CART")
    )
    return cart
