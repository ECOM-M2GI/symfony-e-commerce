from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from order.models import OrderItem  # your OrderItem model


def _sale_item(oi: OrderItem) -> dict:
    return {
        "order_id": str(oi.order_id),
        "product_id": str(oi.product_id),
        "product_name": oi.product_name,
        "unit_price": str(oi.unit_price),
        "quantity": oi.quantity,
        "line_total": str(oi.line_total),
        "buyer_username": getattr(oi.order.user, "username", None),
        "status": oi.order.status,
        "updated_at": oi.order.updated_at,
        "product_image_url": oi.product_image_url.url,
    }


def _purchase_item(oi: OrderItem) -> dict:
    return {
        "order_id": str(oi.order_id),
        "product_id": str(oi.product_id),
        "product_name": oi.product_name,
        "unit_price": str(oi.unit_price),
        "quantity": oi.quantity,
        "line_total": str(oi.line_total),
        "seller_username": getattr(oi.product.created_by, "username", None),
        "status": oi.order.status,
        "updated_at": oi.order.updated_at,
        "product_image_url": oi.product_image_url.url,
    }


@extend_schema(tags=["User"], summary="My purchase history (paid orders)")
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_history_purchases(request):
    qs = (
        OrderItem.objects.filter(order__user=request.user, order__status="PAID")
        .select_related("order", "product", "product__created_by")
        .order_by("-order__updated_at", "-order__created_at")
    )
    return Response([_purchase_item(oi) for oi in qs])


@extend_schema(tags=["User"], summary="My sales history (items I sold)")
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_history_sales(request):
    qs = (
        OrderItem.objects.filter(product__created_by=request.user, order__status="PAID")
        .select_related("order", "product", "order__user")
        .order_by("-order__updated_at", "-order__created_at")
    )
    return Response([_sale_item(oi) for oi in qs])
