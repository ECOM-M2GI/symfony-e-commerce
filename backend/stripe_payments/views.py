from decimal import Decimal

import stripe
from accounts.models import UserProfile
from django.conf import settings
from django.db import IntegrityError
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema
from order.actions.pay_service import compute_totals, finalize_cart_payment
from order.actions.utils import get_or_create_cart_order
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from products.models import Product
from django.db import transaction

from order.models import Order

from ebey.settings import FRONTEND_URL

try:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    stripe.api_version = "2025-08-27.basil"
except AttributeError:
    raise Exception(
        "STRIPE_SECRET_KEY is missing from Django settings! "
        "Please add your Stripe secret key to your settings.py file."
    )
CURRENCY = getattr(settings, "STRIPE_CURRENCY", "eur")
FREE_SHIPPING_THRESHOLD = Decimal("49.00")


def check_stock_availability(cart):
    """
    Check if all items in cart are available in stock.
    Returns (bool, str) - (is_available, error_message)
    """
    items = list(cart.items.all().order_by("id"))
    product_ids = [it.product_id for it in items]

    with transaction.atomic():
        # Lock products to get current stock
        locked = {
            p.id: p
            for p in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        # Check availability
        for item in items:
            product = locked[item.product_id]
            if not product.is_active:
                return False, f"Product '{product.name}' is no longer available."
            if item.quantity > product.stock_quantity:
                return (
                    False,
                    f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}, Requested: {item.quantity}",
                )

    return True, ""


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Create Stripe Checkout Session",
        description="Creates a Stripe checkout session for the user's cart",
    )
    def post(self, request):
        # Get cart data from the request or from the user's cart
        # You'll need to adapt this to your cart model structure

        cart = get_or_create_cart_order(request.user)
        if not cart or cart.items.count() == 0:
            return Response(
                {"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Initial stock check (but we'll do the real check in the payment intent webhook)
        is_available, error_msg = check_stock_availability(cart)
        if not is_available:
            user_profile = UserProfile.objects.get(user=request.user)
            user_profile.cleanup_out_of_stock_items_in_cart()
            return Response(
                {"detail": error_msg},
                status=status.HTTP_409_CONFLICT,
            )

        # compute totals and build line items
        items_total, shipping_total, grand_total = compute_totals(cart)

        line_items = []
        for it in cart.items.all():
            print(it.unit_price)
            print(it.quantity)
            # Stripe expects amounts in the smallest currency unit (cents)
            unit_amount_cents = int((it.unit_price * 100).quantize(Decimal("1")))
            line_items.append(
                {
                    "price_data": {
                        "currency": CURRENCY,
                        "product_data": {
                            "name": it.product_name,
                            # "images": [it.product_image_url.url] if hasattr(it.product_image_url, "url") else [],
                        },
                        "unit_amount": unit_amount_cents,
                    },
                    "quantity": it.quantity,
                }
            )

        # Add shipping as a separate line if applicable
        if shipping_total > 0:
            shipping_cents = int((shipping_total * 100).quantize(Decimal("1")))
            line_items.append(
                {
                    "price_data": {
                        "currency": CURRENCY,
                        "product_data": {"name": "Shipping"},
                        "unit_amount": shipping_cents,
                    },
                    "quantity": 1,
                }
            )

        # Create embedded checkout session
        try:
            # Use idempotency so re-clicks don't create many sessions
            print(cart.id)
            print(cart.items.count())
            print(cart.updated_at)
            print(cart.updated_at.timestamp())
            idem_key = f"checkout_{cart.id}_{cart.updated_at.timestamp()}"
            print(idem_key)
            session = stripe.checkout.Session.create(
                ui_mode="embedded",
                mode="payment",
                line_items=line_items,
                return_url=f"{FRONTEND_URL}/checkout-success?session_id={{CHECKOUT_SESSION_ID}}",
                # expires_at=int(time.time()) + 30 * 60,
                customer_email=request.user.email,
                metadata={
                    "user_id": str(request.user.id),
                    "order_id": str(cart.id),
                    "kind": "cart_payment",
                },
                payment_intent_data={
                    "capture_method": "manual",
                    "receipt_email": request.user.email,
                    "metadata": {
                        "user_id": str(request.user.id),
                        "order_id": str(cart.id),
                        "kind": "cart_payment",
                    },
                },
                idempotency_key=idem_key,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"client_secret": session.client_secret}, status=status.HTTP_200_OK
        )


class StripeSessionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Stripe Checkout Session Status",
        description="Check the session status in Stripe; front can poll this after return_url",
    )
    def get(self, request):
        session_id = request.query_params.get("session_id")
        if not session_id:
            return Response(
                {"error": "session_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            order = Order.objects.get(
                id=session.metadata.get("order_id"), user=request.user
            )
            if order.status == "CART":
                return Response({"status": "processing"}, status=status.HTTP_200_OK)
            return Response(
                {"status": session.payment_status}, status=status.HTTP_200_OK
            )
        except stripe.error.InvalidRequestError:
            return Response(
                {"error": "Invalid session_id"}, status=status.HTTP_400_BAD_REQUEST
            )


def _handle_payment_intent_required_capture(payment_intent):
    """
    Called when payment intent starts processing.
    Check stock availability and cancel payment if stock is insufficient.
    """
    md = payment_intent.get("metadata", {}) or {}
    cart_id = md.get("order_id")

    try:
        finalize_cart_payment(cart_id)
        # Capture the payment now that everything is confirmed
        stripe.PaymentIntent.capture(payment_intent["id"])
        print(f"Payment intent {payment_intent['id']} finalized successfully.")
    except IntegrityError as e:
        print(f"Finalization failed for payment intent {payment_intent['id']}: {e}")

        # Check current PaymentIntent status before attempting to cancel
        current_pi = stripe.PaymentIntent.retrieve(payment_intent["id"])

        # Only attempt to cancel if the payment intent is in a cancellable state
        if current_pi.status not in ["canceled", "requires_capture", "succeeded"]:
            stripe.PaymentIntent.cancel(
                payment_intent["id"], cancellation_reason="abandoned"
            )
            print(f"Payment intent {payment_intent['id']} canceled successfully.")
        else:
            print(
                f"Payment intent {payment_intent['id']} is in status '{current_pi.status}' and cannot be canceled."
            )

        # Expire checkout session to prevent reuse
        try:
            sessions = stripe.checkout.Session.list(payment_intent=payment_intent["id"])
            for sess in sessions:
                if sess.status not in ["expired", "complete"]:
                    print(f"Expiring session {sess['id']}")
                    stripe.checkout.Session.expire(sess["id"])
        except stripe.error.InvalidRequestError as session_error:
            print(f"Could not expire checkout session: {session_error}")

        # Update order status
        order = Order.objects.filter(id=cart_id).first()
        if order and order.status != "FAILED":
            order.status = "FAILED"
            order.save(update_fields=["status"])


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = []  # webhooks are unauthenticated

    def post(self, request):
        payload = request.body
        sig_header = request.headers.get("stripe-signature")
        try:
            endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        except AttributeError:
            return HttpResponse("STRIPE_WEBHOOK_SECRET missing", status=400)

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError:
            return HttpResponse("Invalid payload", status=400)
        except stripe.error.SignatureVerificationError:
            return HttpResponse("Invalid signature", status=400)

        # Handle payment confirmation
        if event["type"] == "payment_intent.amount_capturable_updated":
            payment_intent = event["data"]["object"]
            _handle_payment_intent_required_capture(payment_intent)
        elif event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            print(f"PaymentIntent {payment_intent['id']} succeeded.")
            order_id = payment_intent.get("metadata", {}).get("order_id")
            if order_id:
                order = Order.objects.filter(id=order_id).first()
                if order and order.status != "PAID":
                    order.status = "PAID"
                    order.save(update_fields=["status"])

        return HttpResponse(status=200)
