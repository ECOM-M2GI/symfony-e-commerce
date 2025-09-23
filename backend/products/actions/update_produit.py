from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from ..models import Product
from ..serializers import ProductUpdateSerializer, ProductListSerializer


@extend_schema(
    tags=["Products"],
    summary="Mettre à jour son produit",
    request=ProductUpdateSerializer,
    responses={200: ProductListSerializer, 403: None, 404: None},
)
@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if product.created_by != request.user:
        return Response(
            {"detail": "Forbidden – not your product"}, status=status.HTTP_403_FORBIDDEN
        )
    if (request.data.get("is_active") is False) and product.is_active:
        product.deactivate()
    ser = ProductUpdateSerializer(
        product,
        data=request.data,
        partial=True if request.method == "PATCH" else False,
        context={"request": request},
    )
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    ser.save()
    return Response(ProductListSerializer(product).data)
