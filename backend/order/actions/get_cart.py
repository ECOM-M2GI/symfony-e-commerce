from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from ..serializers import OrderSerializer
from .utils import get_cart_with_products


@extend_schema(tags=["Cart"], summary="Get my cart")
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cart_get(request):
    cart = get_cart_with_products(request.user)
    return Response(OrderSerializer(cart).data)
