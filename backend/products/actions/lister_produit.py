from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from ..models import Product
from ..serializers import ProductListSerializer
from .search_helper import ProductListQuerySerializer

import random


@extend_schema(
    tags=["Products"],
    summary="Lister les produits (recherche + filtres + tri)",
    parameters=[ProductListQuerySerializer],
    responses=ProductListSerializer(many=True),
)
@api_view(["GET"])
@permission_classes([AllowAny])
def list_products(request):
    ser = ProductListQuerySerializer(data=request.query_params)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    p = ser.validated_data

    def val(key):
        v = p.get(key)
        return v if v not in (None, "") else None

    qs = Product.objects.all()

    # --- Search & filters ---
    term = val("name")
    if term:
        qs = qs.filter(Q(name__icontains=term) | Q(description__icontains=term))

    cat = val("category")
    if cat:
        qs = qs.filter(category=cat)

    mode = val("delivery_mode")
    if mode:
        qs = qs.filter(delivery_mode=mode)

    cond = val("condition")
    if cond:
        qs = qs.filter(condition=cond)

    price_min = p.get("price_min", None)
    if price_min is not None:
        qs = qs.filter(price__gte=price_min)

    price_max = p.get("price_max", None)
    if price_max is not None:
        qs = qs.filter(price__lte=price_max)

    if p.get("in_stock") is True:
        qs = qs.filter(stock_quantity__gt=0)

    seller_id = val("seller_id")
    owner_view = False
    if seller_id is not None:
        qs = qs.filter(created_by_id=seller_id)
        # If current user is the seller, allow viewing inactive too
        try:
            if request.user.is_authenticated and int(seller_id) == int(request.user.id):
                owner_view = True
        except (ValueError, TypeError):
            owner_view = False

    staff_view = request.user.is_authenticated and request.user.is_staff

    # --- Visibility rule for is_active ---
    # Public: always only active.
    # Owner or staff: can see all unless is_active explicitly provided.
    is_active = p.get("is_active", None)
    if owner_view or staff_view:
        if is_active is True:
            qs = qs.filter(is_active=True)
        elif is_active is False:
            qs = qs.filter(is_active=False)
        else:
            pass  # see all (both active & inactive)
    else:
        # Force active-only for non-owners, ignoring any provided flag
        qs = qs.filter(is_active=True)

    # --- Ordering (whitelist) ---
    ordering = val("ordering") or "-created_at"
    allowed = {
        "created_at",
        "-created_at",
        "price",
        "-price",
        "name",
        "-name",
        "stock_quantity",
        "-stock_quantity",
    }
    if ordering not in allowed:
        ordering = "-created_at"
    qs = qs.order_by(ordering)

    # --- Popular pick (optional subset) ---
    pop = int(p.get("popular") or 0)
    if pop > 0:
        data_all = ProductListSerializer(qs, many=True).data
        if not data_all:
            return Response([], status=status.HTTP_200_OK)
        n = min(pop, len(data_all))
        idxs = random.sample(range(len(data_all)), n)
        popular_only = [data_all[i] for i in idxs]
        return Response(popular_only, status=status.HTTP_200_OK)

    # Full list
    data = ProductListSerializer(qs, many=True).data
    return Response(data, status=status.HTTP_200_OK)
