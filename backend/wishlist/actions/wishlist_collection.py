from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
)

from products.models import Product
from products.serializers import ProductListSerializer
from ..models import WishlistItem
from ..serializers import WishlistAddSerializer
from .utils import get_or_create_wishlist


def _wishlist_products_queryset(wishlist):
    product_ids = wishlist.items.values_list("product_id", flat=True)
    return Product.objects.filter(id__in=product_ids, is_active=True).order_by(
        "-created_at"
    )


@extend_schema_view(
    get=extend_schema(
        tags=["Wishlist"],
        summary="list products",
        responses=ProductListSerializer,
    ),
    post=extend_schema(
        tags=["Wishlist"],
        summary="add products",
        request=WishlistAddSerializer,
        responses=ProductListSerializer,
    ),
    delete=extend_schema(
        tags=["Wishlist"],
        summary="delete product",
        parameters=[
            OpenApiParameter(
                name="product",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="ID of the product to delete",
                required=True,
            )
        ],
        responses=ProductListSerializer,
    ),
)
@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def wishlist_collection(request):
    wishlist = get_or_create_wishlist(request.user)

    if request.method == "GET":
        qs = _wishlist_products_queryset(wishlist)
        return Response(ProductListSerializer(qs, many=True).data)

    if request.method == "POST":
        ser = WishlistAddSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        product = get_object_or_404(Product, id=ser.validated_data["product"])
        if not product.is_active:
            return Response(
                {"detail": "Produit inactif"}, status=status.HTTP_400_BAD_REQUEST
            )
        WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        qs = _wishlist_products_queryset(wishlist)
        return Response(
            ProductListSerializer(qs, many=True).data, status=status.HTTP_200_OK
        )

    # DELETE
    product_id = request.query_params.get("product")
    if not product_id:
        return Response(
            {"detail": "Paramètre 'product' requis"}, status=status.HTTP_400_BAD_REQUEST
        )
    product = get_object_or_404(Product, id=product_id)
    item = get_object_or_404(WishlistItem, wishlist=wishlist, product=product)
    item.delete()
    qs = _wishlist_products_queryset(wishlist)
    return Response(
        ProductListSerializer(qs, many=True).data, status=status.HTTP_200_OK
    )
