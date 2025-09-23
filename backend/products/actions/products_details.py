# products/actions/products_details.py
from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema, extend_schema_view

from .update_produit import update_product
from .delete_produit import delete_product
from .retrieve_produit import retrieve_product  # NEW

from ..serializers import ProductUpdateSerializer, ProductListSerializer


@extend_schema_view(
    get=extend_schema(
        tags=["Products"],
        summary="Retrieve product",
        responses={200: ProductListSerializer, 404: None},
    ),
    put=extend_schema(
        tags=["Products"],
        summary="Update product (full)",
        request=ProductUpdateSerializer,
        responses={
            200: ProductListSerializer,
            400: None,
            401: None,
            403: None,
            404: None,
        },
    ),
    patch=extend_schema(
        tags=["Products"],
        summary="Update product (partial)",
        request=ProductUpdateSerializer,
        responses={
            200: ProductListSerializer,
            400: None,
            401: None,
            403: None,
            404: None,
        },
    ),
    delete=extend_schema(
        tags=["Products"],
        summary="Delete product",
        responses={204: None, 401: None, 403: None, 404: None},
    ),
)
@api_view(["GET", "PUT", "PATCH", "DELETE"])
def products_details(request, pk):
    if request.method == "GET":
        return retrieve_product(request._request, pk)
    if request.method == "DELETE":
        return delete_product(request._request, pk)
    # PUT/PATCH
    return update_product(request._request, pk)
