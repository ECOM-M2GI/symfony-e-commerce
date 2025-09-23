# order/actions/pay_order.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from django.db import IntegrityError
from ..serializers import OrderSerializer
from .pay_service import finalize_cart_payment


@extend_schema(tags=["Cart"], summary="Pay my cart")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pay_my_cart(request):
    try:
        order, _ = finalize_cart_payment(request.user.id)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
    except IntegrityError as e:
        return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
