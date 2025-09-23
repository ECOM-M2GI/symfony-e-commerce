from django.db import transaction
from ..models import Wishlist


@transaction.atomic
def get_or_create_wishlist(user):
    wishlist, _ = Wishlist.objects.select_for_update().get_or_create(user=user)
    return wishlist
