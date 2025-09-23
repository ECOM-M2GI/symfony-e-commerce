from django.urls import path
from .views import CreateCheckoutSessionView, StripeWebhookView, StripeSessionStatusView

urlpatterns = [
    path(
        "create-checkout-session/",
        CreateCheckoutSessionView.as_view(),
        name="create-checkout-session",
    ),
    path("session-status/", StripeSessionStatusView.as_view(), name="session-status"),
    path("stripe-webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
