from uuid import uuid4

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestRegistration:
    def test_register_success_creates_user_and_profile(self, api_client):
        url = reverse("register")
        uname = f"alice_{uuid4().hex[:8]}"
        payload = {
            "username": uname,
            "email": f"{uname}@example.com",
            "password": "StrongPass!123",
            "password_confirm": "StrongPass!123",
            "first_name": "Alice",
            "last_name": "Doe",
        }
        resp = api_client.post(url, data=payload, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        body = resp.json()
        assert body["message"] == "User created successfully"
        assert body["username"] == uname
        # DB assertions
        user = User.objects.get(username=uname)
        assert user.email == f"{uname}@example.com"
        # profile is created by serializer
        assert hasattr(user, "userprofile")

    def test_register_password_mismatch_400(self, api_client):
        url = reverse("register")
        payload = {
            "username": "bob",
            "email": "bob@example.com",
            "password": "pw1",
            "password_confirm": "pw2",
        }
        resp = api_client.post(url, data=payload, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        data = resp.json()
        # ValidationError message is returned under non_field_errors by DRF
        assert "non_field_errors" in data
        assert any("Passwords don't match" in s for s in data["non_field_errors"])

    def test_register_missing_required_fields_400(self, api_client):
        url = reverse("register")
        payload = {
            "email": "charlie@example.com",
            "password": "pw",
            "password_confirm": "pw",
        }
        resp = api_client.post(url, data=payload, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        data = resp.json()
        assert "username" in data  # required by serializer


@pytest.mark.django_db
class TestLogin:
    def test_login_success_200(self, api_client):
        uname = f"dora_{uuid4().hex[:8]}"
        user = User.objects.create_user(
            username=uname, email=f"{uname}@example.com", password="StrongPass!123"
        )
        url = reverse("login")
        payload = {"username": uname, "password": "StrongPass!123"}
        resp = api_client.post(url, data=payload, format="json")
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data["message"] == "Login successful"
        assert data["username"] == uname
        assert data["user_id"] == user.id

    def test_login_invalid_credentials_401(self, api_client):
        User.objects.create_user(username="erin", password="right-pass")
        url = reverse("login")
        payload = {"username": "erin", "password": "wrong-pass"}
        resp = api_client.post(url, data=payload, format="json")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED
        data = resp.json()
        assert data["error"] == "Invalid credentials"

    def test_login_missing_fields_400(self, api_client):
        url = reverse("login")
        resp = api_client.post(url, data={}, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        data = resp.json()
        # DRF reports required field errors per field for missing data
        assert "username" in data
        assert "password" in data


@pytest.mark.django_db
class TestProfileAndLogout:
    def test_logout_requires_auth_and_succeeds_when_authenticated(self, api_client):
        # Unauthenticated should fail
        url = reverse("logout")
        resp = api_client.post(url)
        assert resp.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

        # Authenticated should succeed
        user = User.objects.create_user(username="mike", password="pass123")
        api_client.force_authenticate(user=user)
        resp2 = api_client.post(url)
        assert resp2.status_code == status.HTTP_200_OK
        assert resp2.json()["message"] == "Logged out successfully"
