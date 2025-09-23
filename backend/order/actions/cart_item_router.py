from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema, extend_schema_view
from ..serializers import OrderSerializer, OrderItemUpsertSerializer
from .update_item import cart_set_quantity
from .remove_item import cart_remove_item


@extend_schema_view(
    patch=extend_schema(
        tags=["Cart"],
        summary="Changer la quantité d un produit dans le panier",
        request=OrderItemUpsertSerializer,
        responses={200: OrderSerializer, 400: None, 409: None, 401: None},
    ),
    delete=extend_schema(
        tags=["Cart"],
        summary="Retirer un produit du panier",
        responses={204: None, 401: None},
    ),
)
@api_view(["PATCH", "DELETE"])
def cart_item_router(request, product_id):
    if request.method == "PATCH":
        return cart_set_quantity(request._request, product_id)
    return cart_remove_item(request._request, product_id)
