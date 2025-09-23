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
    summary="Ajouter un article au panier",
    request=OrderItemUpsertSerializer,
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_add_item(request):
    cart = get_or_create_cart_order(request.user)

    ser = OrderItemUpsertSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    product = get_object_or_404(Product, id=ser.validated_data["product"])
    if not product.is_active:
        return Response(
            {"detail": "Produit inactif"}, status=status.HTTP_400_BAD_REQUEST
        )
    if product.created_by_id == request.user.id:
        return Response(
            {"detail": "u cannot buy ur own product"},
            status=status.HTTP_403_FORBIDDEN,
        )

    qty = ser.validated_data["quantity"]

    # Validation quantité & stock
    if qty <= 0:
        return Response(
            {"detail": "La quantité doit être strictement positive."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if product.stock_quantity <= 0:
        return Response(
            {"detail": "Produit en rupture de stock."},
            status=status.HTTP_409_CONFLICT,
        )

    # Snapshots vendeur + frais de livraison produit
    seller_id = product.created_by_id
    seller_username = (
        getattr(product.created_by, "username", "") if product.created_by_id else ""
    )
    product_category = product.category
    if product.delivery_mode == "hand_to_hand":
        product_shipping_fee = None
    else:
        product_shipping_fee = getattr(product, "shipping_fee", None)
        product_shipping_fee = (
            product_shipping_fee
            if product_shipping_fee is not None
            else Decimal("0.00")
        )

    # Upsert avec contrôle de stock cumulatif
    item, created = OrderItem.objects.get_or_create(
        order=cart,
        product=product,
        defaults={
            "product_name": product.name,
            "product_image_url": product.image_url,  # ok si vous stockez un chemin/nom de fichier
            "unit_price": product.price,
            "quantity": qty,
            "line_total": Decimal(product.price) * qty,
            "product_category": product_category,
            "seller_id": seller_id,
            "seller_username": seller_username,
            "product_shipping_fee": product_shipping_fee,
        },
    )

    if not created:
        new_qty = item.quantity + qty
        if new_qty > product.stock_quantity:
            return Response(
                {"detail": f"Stock insuffisant. Disponible: {product.stock_quantity}"},
                status=status.HTTP_409_CONFLICT,
            )
        item.quantity = new_qty
        item.line_total = Decimal(item.unit_price) * item.quantity
        item.product_category = product_category
        item.seller_id = seller_id
        item.seller_username = seller_username
        item.product_shipping_fee = product_shipping_fee
        item.save(
            update_fields=[
                "quantity",
                "line_total",
                "seller_id",
                "seller_username",
                "product_shipping_fee",
                "product_category",
            ]
        )
    else:
        if qty > product.stock_quantity:
            # annuler la ligne créée si dépassement
            item.delete()
            return Response(
                {"detail": f"Stock insuffisant. Disponible: {product.stock_quantity}"},
                status=status.HTTP_409_CONFLICT,
            )

    # Garder order.total comme sous-total des items (sans frais de port)
    cart.total = sum(i.line_total for i in cart.items.all())
    cart.save(update_fields=["total", "updated_at"])

    return Response(OrderSerializer(cart).data, status=status.HTTP_200_OK)
