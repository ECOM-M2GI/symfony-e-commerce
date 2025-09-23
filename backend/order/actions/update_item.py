from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from products.models import Product
from ..models import OrderItem
from ..serializers import OrderItemUpsertSerializer, OrderSerializer
from .utils import get_or_create_cart_order


@extend_schema(
    tags=["Cart"],
    summary="Définir la quantité d'un produit dans le panier",
    request=OrderItemUpsertSerializer,
)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cart_set_quantity(request, product_id):
    cart = get_or_create_cart_order(request.user)
    product = get_object_or_404(Product, id=product_id)
    item = get_object_or_404(OrderItem, order=cart, product=product)

    ser = OrderItemUpsertSerializer(data={**request.data, "product": str(product_id)})
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    new_qty = ser.validated_data["quantity"]

    # Garde-fous quantité
    if new_qty <= 0:
        return Response(
            {"detail": "La quantité doit être strictement positive."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not product.is_active:
        return Response(
            {"detail": "Produit inactif"}, status=status.HTTP_400_BAD_REQUEST
        )

    if new_qty > product.stock_quantity:
        return Response(
            {"detail": f"Stock insuffisant. Disponible: {product.stock_quantity}"},
            status=status.HTTP_409_CONFLICT,
        )

    item.quantity = new_qty
    item.line_total = Decimal(item.unit_price) * new_qty
    item.save(update_fields=["quantity", "line_total"])

    cart.total = sum(i.line_total for i in cart.items.all())
    cart.save(update_fields=["total", "updated_at"])
    return Response(OrderSerializer(cart).data, status=status.HTTP_200_OK)
