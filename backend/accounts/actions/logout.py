from django.contrib.auth import logout as django_logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema


@extend_schema(
    operation_id="logout",
    summary="User Logout",
    description="Log out the currently authenticated user",
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Simple logout endpoint
    """
    django_logout(request)
    return Response({"message": "Logged out successfully"})
