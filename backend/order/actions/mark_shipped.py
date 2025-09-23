from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from ..models import Order
from ..serializers import OrderSerializer


@extend_schema(tags=["Orders"], summary="Mark PAID order as SHIPPED")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_shipped(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    if order.status != "PAID":
        return Response(
            {"detail": "Order must be PAID first"}, status=status.HTTP_400_BAD_REQUEST
        )
    order.status = "SHIPPED"
    order.save(update_fields=["status", "updated_at"])
    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
