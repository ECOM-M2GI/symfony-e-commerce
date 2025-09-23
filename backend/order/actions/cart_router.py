from rest_framework.decorators import api_view
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
)
from ..serializers import OrderSerializer, OrderItemUpsertSerializer
from .get_cart import cart_get
from .add_item import cart_add_item
from .clear_cart import cart_clear
from .pay_order import pay_my_cart


@extend_schema_view(
    get=extend_schema(
        tags=["Cart"],
        summary="Obtenir mon panier",
        responses={200: OrderSerializer},
    ),
    post=extend_schema(
        tags=["Cart"],
        summary="Ajouter un article au panier",
        request=OrderItemUpsertSerializer,
        responses={200: OrderSerializer, 400: None, 401: None},
    ),
    delete=extend_schema(
        tags=["Cart"],
        summary="Vider le panier",
        responses={204: None, 401: None},
    ),
)
@api_view(["GET", "POST", "DELETE"])
def cart_router(request):
    if request.method == "GET":
        return cart_get(request._request)
    if request.method == "POST":
        return cart_add_item(request._request)
    return cart_clear(request._request)


# Sous-chemin /pay/ : POST pour payer le panier
@extend_schema(
    tags=["Cart"],
    summary="Payer mon panier (transaction atomique)",
    responses={200: OrderSerializer, 400: None, 409: None, 401: None},
)
@api_view(["POST"])
def cart_pay_router(request):
    return pay_my_cart(request._request)
