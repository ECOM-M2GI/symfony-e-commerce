# account/actions/my_products.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from products.models import Product
from products.serializers import ProductListSerializer


@extend_schema(tags=["User"], summary="My products for sale")
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_products(request):
    qs = Product.objects.filter(created_by=request.user).order_by("-created_at")
    return Response(ProductListSerializer(qs, many=True).data)
