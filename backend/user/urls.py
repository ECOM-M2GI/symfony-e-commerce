from django.urls import path
from .actions.account_collection import account_collection
from .actions.my_products import my_products
from .actions.my_history import my_history_purchases, my_history_sales

urlpatterns = [
    path("", account_collection, name="account-collection"),
    path("products/", my_products, name="my products"),
    path("purchases/", my_history_purchases, name="my purchases"),
    path("sales/", my_history_sales, name="my sales"),
]
