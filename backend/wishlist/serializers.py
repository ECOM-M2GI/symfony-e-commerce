# wishlist/serializers.py
from rest_framework import serializers


# Pour l'ajout (POST)
class WishlistAddSerializer(serializers.Serializer):
    product = serializers.UUIDField()
