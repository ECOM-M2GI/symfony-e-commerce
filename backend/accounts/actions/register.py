from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ..serializers import UserRegistrationSerializer


@extend_schema(
    operation_id="register",
    summary="User Registration",
    description="Register a new user account",
    request=UserRegistrationSerializer,
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                "message": "User created successfully",
                "user_id": user.id,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
