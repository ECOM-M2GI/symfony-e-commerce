# account/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import UserProfile  # reuse your existing model


class MeReadSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    email = serializers.EmailField(allow_blank=True)

    # From UserProfile
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)


class MeUpdateSerializer(serializers.Serializer):
    # User core
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    # Optional password change
    password = serializers.CharField(required=False, write_only=True, min_length=6)

    # Profile fields
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    def update_user_and_profile(self, user: User, data: dict) -> User:
        # Update User core fields
        for f in ("first_name", "last_name", "email"):
            if f in data:
                setattr(user, f, data[f])
        if data.get("password"):
            user.set_password(data["password"])
        user.save()

        # Ensure a profile exists and update it
        profile, _ = UserProfile.objects.get_or_create(user=user)
        for f in ("phone_number", "address", "date_of_birth"):
            if f in data:
                setattr(profile, f, data[f])
        profile.save()
        return user
