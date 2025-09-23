from django.urls import path
from .actions.products_collection import products_collection
from .actions.products_details import products_details

urlpatterns = [
    path("", products_collection, name="products-collection"),
    path("<uuid:pk>/", products_details, name="product-detail"),
]
