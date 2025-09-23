from django.urls import path
from .actions.cart_router import cart_router, cart_pay_router
from .actions.cart_item_router import cart_item_router
from .actions.order_router import order_ship_router

urlpatterns = [
    # panier
    path("cart/", cart_router, name="cart"),
    path("cart/pay/", cart_pay_router, name="cart-pay"),
    path("cart/items/<uuid:product_id>/", cart_item_router, name="cart-item"),
    # commande
    path("orders/<uuid:order_id>/", order_ship_router, name="order-ship"),
]
