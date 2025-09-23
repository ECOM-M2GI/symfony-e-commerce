# user/actions/account_collection.py
from django.contrib.auth.models import User
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from accounts.models import UserProfile


class PatchMeSerializer(serializers.Serializer):
    # User core
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, write_only=True, min_length=6)
    # Profile
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)


class MeReadSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    email = serializers.EmailField(allow_blank=True)
    # Profile
    phone_number = serializers.CharField(allow_blank=True, required=False)
    address = serializers.CharField(allow_blank=True, required=False)
    date_of_birth = serializers.DateField(allow_null=True, required=False)


def _payload(user: User) -> dict:
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "email": user.email or "",
        "phone_number": profile.phone_number or "",
        "address": profile.address or "",
        "date_of_birth": profile.date_of_birth,
    }


@extend_schema(
    tags=["User"],
    summary="my profile",
    description="GET returns your profile. PATCH updates any of the provided fields.",
    request=PatchMeSerializer,
    responses={200: MeReadSerializer},
)
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def account_collection(request):
    # Ensure a profile exists
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return Response(_payload(request.user), status=status.HTTP_200_OK)

    # PATCH
    ser = PatchMeSerializer(data=request.data, partial=True)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    data = ser.validated_data

    # Update User core
    for f in ("first_name", "last_name", "email"):
        if f in data:
            setattr(request.user, f, data[f])
    if "password" in data and data["password"]:
        request.user.set_password(data["password"])
    request.user.save()

    # Update Profile
    for f in ("phone_number", "address", "date_of_birth"):
        if f in data:
            setattr(profile, f, data[f])
    profile.save()

    return Response(_payload(request.user), status=status.HTTP_200_OK)
