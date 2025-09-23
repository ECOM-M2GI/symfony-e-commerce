from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from ..serializers import ProductCreateSerializer, ProductListSerializer


@extend_schema(
    tags=["Products"],
    summary="Créer un produit",
    request={
        "multipart/form-data": ProductCreateSerializer,
    },
    responses={201: ProductListSerializer},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_product(request):
    ser = ProductCreateSerializer(data=request.data, context={"request": request})
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    product = ser.save(created_by=request.user)
    return Response(ProductListSerializer(product).data, status=status.HTTP_201_CREATED)
