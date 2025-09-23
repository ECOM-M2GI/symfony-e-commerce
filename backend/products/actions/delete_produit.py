from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from ..models import Product


@extend_schema(
    tags=["Products"],
    summary="Supprimer son produit",
    responses={204: None, 403: None, 404: None},
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if product.created_by != request.user:
        return Response(
            {"detail": "Forbidden this is not your product"},
            status=status.HTTP_403_FORBIDDEN,
        )
    product.delete_p()
    return Response(status=status.HTTP_204_NO_CONTENT)
