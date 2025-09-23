from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..serializers import UserLoginSerializer


@extend_schema(
    operation_id="login",
    summary="User Login",
    request=UserLoginSerializer,
    description="Authenticate user with username and password",
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Simple login endpoint (JWT tokens later)
    """

    serializer = UserLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data.get("username")
    password = serializer.validated_data.get("password")

    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            # convert abstract user to our user model
            user = User.objects.get(username=username)
            return Response(
                {
                    "message": "Login successful",
                    "user_id": user.id,
                    "username": user.username,
                }
            )
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
    return Response(
        {"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST
    )
