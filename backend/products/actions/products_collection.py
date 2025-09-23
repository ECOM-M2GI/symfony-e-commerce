from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema, extend_schema_view
from .lister_produit import list_products
from .ajouter_produit import add_product
from ..serializers import ProductCreateSerializer, ProductListSerializer
from .search_helper import ProductListQuerySerializer


@extend_schema_view(
    get=extend_schema(
        tags=["Products"],
        summary="Lister les produits (recherche + filtres + tri)",
        parameters=[ProductListQuerySerializer],
        responses=ProductListSerializer(many=True),
    ),
    post=extend_schema(
        tags=["Products"],
        summary="Créer un produit",
        request=ProductCreateSerializer,
        responses=ProductListSerializer,
    ),
)
@api_view(["GET", "POST"])
def products_collection(request):
    if request.method == "GET":
        return list_products(request._request)  # pass raw HttpRequest
    return add_product(request._request)
