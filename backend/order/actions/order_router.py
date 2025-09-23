from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema
from ..serializers import OrderSerializer
from .mark_shipped import mark_shipped


@extend_schema(
    tags=["Orders"],
    summary="Marquer la commande comme expédiée",
    responses={200: OrderSerializer, 400: None, 401: None},
)
@api_view(["POST"])
def order_ship_router(request, order_id):
    return mark_shipped(request._request, order_id)
