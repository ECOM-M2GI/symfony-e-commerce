from django.urls import path
from .actions.wishlist_collection import wishlist_collection

urlpatterns = [
    path("", wishlist_collection, name="wishlist-collection"),
]
