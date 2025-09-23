from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from .utils import get_or_create_cart_order


@extend_schema(tags=["Cart"], summary="Clear my cart")
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cart_clear(request):
    cart = get_or_create_cart_order(request.user)
    cart.items.all().delete()
    cart.total = 0
    cart.save(update_fields=["total"])
    return Response(status=status.HTTP_204_NO_CONTENT)
