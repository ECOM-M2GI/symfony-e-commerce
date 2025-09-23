from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema


@extend_schema(
    operation_id="health_check",
    summary="Health Check",
    description="Check API health status",
    responses={
        200: {
            "description": "API is healthy",
            "content": {
                "application/json": {"example": {"status": "success", "data": None}}
            },
        }
    },
    tags=["Health"],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "success", "data": None})
