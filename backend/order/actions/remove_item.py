from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from products.models import Product
from ..models import OrderItem
from .utils import get_or_create_cart_order


@extend_schema(tags=["Cart"], summary="Remove product from cart")
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cart_remove_item(request, product_id):
    cart = get_or_create_cart_order(request.user)
    product = get_object_or_404(Product, id=product_id)
    item = get_object_or_404(OrderItem, order=cart, product=product)
    item.delete()
    cart.total = sum(i.line_total for i in cart.items.all())
    cart.save(update_fields=["total"])
    return Response(status=status.HTTP_204_NO_CONTENT)
