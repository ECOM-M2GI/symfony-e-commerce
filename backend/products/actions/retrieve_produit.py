# products/actions/retrieve_produit.py
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ..models import Product
from ..serializers import ProductListSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def retrieve_product(request, pk):
    product = get_object_or_404(Product, id=pk)

    can_view_inactive = request.user.is_authenticated and (
        request.user.is_staff or request.user == product.created_by
    )
    if not product.is_active and not can_view_inactive:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response(ProductListSerializer(product).data, status=status.HTTP_200_OK)
