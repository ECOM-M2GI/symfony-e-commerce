import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from products.models import Product


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser", email="test@example.com", password="testpass123"
    )


@pytest.fixture
def seller():
    return User.objects.create_user(
        username="seller", email="seller@example.com", password="sellerpass123"
    )


@pytest.fixture
def product(seller):
    return Product.objects.create(
        name="Test Product",
        description="A test product",
        price=Decimal("25.00"),
        stock_quantity=10,
        is_active=True,
        shipping_fee=Decimal("5.00"),
        delivery_mode="by_mail",
        category="home",
        condition="good",
        created_by=seller,
    )


@pytest.fixture
def expensive_product(seller):
    return Product.objects.create(
        name="Expensive Product",
        description="An expensive test product for free shipping",
        price=Decimal("55.00"),
        stock_quantity=5,
        is_active=True,
        shipping_fee=Decimal("10.00"),
        delivery_mode="by_mail",
        category="home",
        condition="new",
        created_by=seller,
    )


@pytest.fixture
def out_of_stock_product(seller):
    return Product.objects.create(
        name="Out of Stock Product",
        description="A product with no stock",
        price=Decimal("20.00"),
        stock_quantity=0,
        is_active=True,
        shipping_fee=Decimal("3.00"),
        created_by=seller,
    )


@pytest.fixture
def inactive_product(seller):
    return Product.objects.create(
        name="Inactive Product",
        description="An inactive product",
        price=Decimal("15.00"),
        stock_quantity=5,
        is_active=False,
        shipping_fee=Decimal("2.00"),
        created_by=seller,
    )


@pytest.mark.django_db
class TestCart:
    def test_add_item_success_200(self, api_client, user, product):
        """Test successfully adding an item to cart returns 200"""
        api_client.force_authenticate(user=user)

        data = {"product": str(product.id), "quantity": 2}

        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_200_OK
        assert "items" in response.data
        assert len(response.data["items"]) == 1
        assert response.data["items"][0]["quantity"] == 2
        assert response.data["items"][0]["product_name"] == "Test Product"
        assert Decimal(response.data["total"]) == Decimal("50.00")  # 2 * 25.00

    def test_clear_cart_success_204(self, api_client, user, product):
        """Test clearing cart returns 204 and removes all items"""
        api_client.force_authenticate(user=user)

        # First add an item
        data = {"product": str(product.id), "quantity": 1}
        api_client.post("/api/v1/cart/", data)

        # Then clear the cart
        response = api_client.delete("/api/v1/cart/")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify cart is empty
        get_response = api_client.get("/api/v1/cart/")
        assert len(get_response.data["items"]) == 0
        assert Decimal(get_response.data["total"]) == Decimal("0.00")

    def test_add_item_and_retrieve_cart(self, api_client, user, product):
        """Test adding item and then retrieving cart shows the item"""
        api_client.force_authenticate(user=user)

        # Retrieve cart
        get_response = api_client.get("/api/v1/cart/")

        assert get_response.status_code == status.HTTP_200_OK
        assert len(get_response.data["items"]) == 1
        assert get_response.data["items"][0]["quantity"] == 3
        assert Decimal(get_response.data["total"]) == Decimal("75.00")  # 3 * 25.00

        # Check calculated fields - subtotal of 75.00 exceeds free shipping threshold of 49.00
        assert Decimal(get_response.data["subtotal"]) == Decimal("75.00")
        assert Decimal(get_response.data["shipping_total"]) == Decimal(
            "0.00"
        )  # Free shipping due to threshold
        assert Decimal(get_response.data["grand_total"]) == Decimal(
            "75.00"
        )  # subtotal + 0 shipping

    def test_empty_cart_retrieve(self, api_client, user):
        """Test retrieving an empty cart returns empty items list"""
        api_client.force_authenticate(user=user)

        response = api_client.get("/api/v1/cart/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["items"]) == 0
        assert Decimal(response.data["total"]) == Decimal("0.00")
        assert Decimal(response.data["subtotal"]) == Decimal("0.00")
        assert Decimal(response.data["shipping_total"]) == Decimal("0.00")
        assert Decimal(response.data["grand_total"]) == Decimal("0.00")

    def test_empty_cart_and_add_item(self, api_client, user, product):
        """Test starting with empty cart, then adding an item"""
        api_client.force_authenticate(user=user)

        # Verify cart starts empty
        get_response = api_client.get("/api/v1/cart/")
        assert len(get_response.data["items"]) == 0

        # Add item
        data = {"product": str(product.id), "quantity": 1}
        add_response = api_client.post("/api/v1/cart/", data)

        assert add_response.status_code == status.HTTP_200_OK
        assert len(add_response.data["items"]) == 1
        assert Decimal(add_response.data["total"]) == Decimal("25.00")

    def test_empty_cart_and_add_item_retrieve(self, api_client, user, product):
        """Test empty cart → add item → retrieve shows item"""
        api_client.force_authenticate(user=user)

        # Start with empty cart
        get_response = api_client.get("/api/v1/cart/")
        assert len(get_response.data["items"]) == 0

        # Add item
        data = {"product": str(product.id), "quantity": 2}
        api_client.post("/api/v1/cart/", data)

        # Retrieve again
        final_response = api_client.get("/api/v1/cart/")
        assert len(final_response.data["items"]) == 1
        assert final_response.data["items"][0]["quantity"] == 2
        assert Decimal(final_response.data["total"]) == Decimal("50.00")

    def test_add_item_empty_cart_and_add_item_retrieve(self, api_client, user, product):
        """Test add item → clear cart → add item → retrieve"""
        api_client.force_authenticate(user=user)

        # Add first item
        data = {"product": str(product.id), "quantity": 1}
        api_client.post("/api/v1/cart/", data)

        # Clear cart
        api_client.delete("/api/v1/cart/")

        # Add item again
        data = {"product": str(product.id), "quantity": 3}
        api_client.post("/api/v1/cart/", data)

        # Retrieve final state
        final_response = api_client.get("/api/v1/cart/")
        assert len(final_response.data["items"]) == 1
        assert final_response.data["items"][0]["quantity"] == 3
        assert Decimal(final_response.data["total"]) == Decimal("75.00")

    def test_add_multiple_items_different_products(
        self, api_client, user, product, expensive_product
    ):
        """Test adding different products to cart"""
        api_client.force_authenticate(user=user)

        # Add first product
        data1 = {"product": str(product.id), "quantity": 2}
        api_client.post("/api/v1/cart/", data1)

        # Add second product
        data2 = {"product": str(expensive_product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data2)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["items"]) == 2
        # Total should be (2 * 25.00) + (1 * 55.00) = 105.00
        assert Decimal(response.data["total"]) == Decimal("105.00")

    def test_add_same_item_twice_increases_quantity(self, api_client, user, product):
        """Test adding the same product twice increases quantity"""
        api_client.force_authenticate(user=user)

        # Add first time
        data = {"product": str(product.id), "quantity": 2}
        api_client.post("/api/v1/cart/", data)

        # Add same product again
        data = {"product": str(product.id), "quantity": 3}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["items"]) == 1  # Still one unique product
        assert response.data["items"][0]["quantity"] == 5  # 2 + 3
        assert Decimal(response.data["total"]) == Decimal("125.00")  # 5 * 25.00

    def test_add_item_exceeds_stock_returns_409(self, api_client, user, product):
        """Test adding more items than in stock returns conflict"""
        api_client.force_authenticate(user=user)

        # Try to add more than stock (product has 10 in stock)
        data = {"product": str(product.id), "quantity": int(15)}
        response = api_client.post("/api/v1/cart/", data)

        print(response.data)
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "Stock insuffisant" in response.data["detail"]

    def test_add_out_of_stock_product_returns_409(
        self, api_client, user, out_of_stock_product
    ):
        """Test adding out of stock product returns conflict"""
        api_client.force_authenticate(user=user)

        data = {"product": str(out_of_stock_product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_409_CONFLICT
        assert "rupture de stock" in response.data["detail"]

    def test_add_inactive_product_returns_400(self, api_client, user, inactive_product):
        """Test adding inactive product returns bad request"""
        api_client.force_authenticate(user=user)

        data = {"product": str(inactive_product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Produit inactif" in response.data["detail"]

    def test_add_own_product_returns_403(self, api_client, user):
        """Test user cannot add their own product to cart"""
        api_client.force_authenticate(user=user)

        # Create product owned by the same user
        own_product = Product.objects.create(
            name="My Product",
            price=Decimal("30.00"),
            stock_quantity=5,
            is_active=True,
            created_by=user,
        )

        data = {"product": str(own_product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "cannot buy ur own product" in response.data["detail"]

    def test_add_invalid_quantity_returns_400(self, api_client, user, product):
        """Test adding item with invalid quantity returns bad request"""
        api_client.force_authenticate(user=user)

        # Test zero quantity
        data = {"product": str(product.id), "quantity": 0}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # DRF serializer validation errors return field-specific errors
        assert "quantity" in response.data
        assert len(response.data["quantity"]) > 0

    def test_free_shipping_threshold(self, api_client, user, expensive_product):
        """Test free shipping is applied when threshold is met"""
        api_client.force_authenticate(user=user)

        # Add expensive product that should trigger free shipping (>= 49.00)
        data = {"product": str(expensive_product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data["subtotal"]) == Decimal("55.00")
        assert Decimal(response.data["shipping_total"]) == Decimal(
            "0.00"
        )  # Free shipping
        assert Decimal(response.data["grand_total"]) == Decimal("55.00")
        assert Decimal(response.data["free_shipping_threshold"]) == Decimal("49.00")

    def test_unauthenticated_access_returns_401(self, api_client, product):
        """Test unauthenticated requests return 401"""
        # Don't authenticate

        # Test GET
        response = api_client.get("/api/v1/cart/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Test POST
        data = {"product": str(product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Test DELETE
        response = api_client.delete("/api/v1/cart/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_nonexistent_product_returns_404(self, api_client, user):
        """Test adding nonexistent product returns 404"""
        api_client.force_authenticate(user=user)

        import uuid

        fake_id = uuid.uuid4()

        data = {"product": str(fake_id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_cart_preserves_seller_info(self, api_client, user, product, seller):
        """Test that cart items preserve seller information"""
        api_client.force_authenticate(user=user)

        data = {"product": str(product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_200_OK
        item = response.data["items"][0]
        assert item["seller_id"] == seller.id
        assert item["seller_username"] == seller.username
        assert Decimal(item["product_shipping_fee"]) == Decimal("5.00")

    def test_update_cart_item_invalid_quantity(self, api_client, user, product):
        """Test updating cart item with invalid quantity returns bad request"""
        api_client.force_authenticate(user=user)

        # First add an item
        data = {"product": str(product.id), "quantity": 2}
        api_client.post("/api/v1/cart/", data)

        # Try to update to zero quantity
        update_data = {"product": str(product.id), "quantity": 0}
        response = api_client.patch(f"/api/v1/cart/items/{product.id}/", update_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_remove_cart_item_success(self, api_client, user, product):
        """Test successfully removing an item from cart"""
        api_client.force_authenticate(user=user)

        # First add an item
        data = {"product": str(product.id), "quantity": 2}
        api_client.post("/api/v1/cart/", data)

        # Remove the item
        response = api_client.delete(f"/api/v1/cart/items/{product.id}/")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify item is removed
        get_response = api_client.get("/api/v1/cart/")
        assert len(get_response.data["items"]) == 0
        assert Decimal(get_response.data["total"]) == Decimal("0.00")

    def test_remove_nonexistent_cart_item(self, api_client, user, product):
        """Test removing non-existent cart item returns 404"""
        api_client.force_authenticate(user=user)

        # Try to remove item that was never added
        response = api_client.delete(f"/api/v1/cart/items/{product.id}/")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_nonexistent_cart_item(self, api_client, user, product):
        """Test updating non-existent cart item returns 404"""
        api_client.force_authenticate(user=user)

        # Try to update item that was never added
        update_data = {"product": str(product.id), "quantity": 3}
        response = api_client.patch(f"/api/v1/cart/items/{product.id}/", update_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_cart_item_operations_unauthenticated(self, api_client, product):
        """Test cart item operations require authentication"""
        # Don't authenticate

        # Test PATCH
        update_data = {"product": str(product.id), "quantity": 3}
        response = api_client.patch(f"/api/v1/cart/items/{product.id}/", update_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Test DELETE
        response = api_client.delete(f"/api/v1/cart/items/{product.id}/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_cart_shipping_calculation_below_threshold(self, api_client, user, seller):
        """Test shipping calculation when below free shipping threshold"""
        api_client.force_authenticate(user=user)

        # Create a cheap product to stay below threshold
        cheap_product = Product.objects.create(
            name="Cheap Product",
            description="A cheap product",
            price=Decimal("10.00"),
            stock_quantity=10,
            is_active=True,
            shipping_fee=Decimal("7.50"),
            delivery_mode="by_mail",
            category="home",
            condition="good",
            created_by=seller,
        )

        data = {"product": str(cheap_product.id), "quantity": 2}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data["subtotal"]) == Decimal("20.00")  # 2 * 10.00
        assert Decimal(response.data["shipping_total"]) == Decimal("15.00")  # 2 * 7.50
        assert Decimal(response.data["grand_total"]) == Decimal(
            "35.00"
        )  # 20.00 + 15.00

    def test_mixed_cart_with_free_shipping_threshold(
        self, api_client, user, product, expensive_product
    ):
        """Test cart with mixed products meeting free shipping threshold"""
        api_client.force_authenticate(user=user)

        # Add regular product
        data1 = {"product": str(product.id), "quantity": 1}
        api_client.post("/api/v1/cart/", data1)

        # Add expensive product to cross threshold
        data2 = {"product": str(expensive_product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data2)

        assert response.status_code == status.HTTP_200_OK
        # Total: 25.00 + 55.00 = 80.00 (exceeds 49.00 threshold)
        assert Decimal(response.data["subtotal"]) == Decimal("80.00")
        assert Decimal(response.data["shipping_total"]) == Decimal(
            "0.00"
        )  # Free shipping
        assert Decimal(response.data["grand_total"]) == Decimal("80.00")

    def test_cart_item_product_image_url_handling(self, api_client, user, product):
        """Test that cart items handle product image URLs correctly"""
        api_client.force_authenticate(user=user)

        data = {"product": str(product.id), "quantity": 1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_200_OK
        item = response.data["items"][0]
        # The product_image_url field should be present even if empty/null
        assert "product_image_url" in item

    def test_add_item_clear_cart_add_same_item_retrieve(
        self, api_client, user, product
    ):
        """Test add item → clear cart → add same item → retrieve show items"""
        api_client.force_authenticate(user=user)

        # Add item first time to cart
        data = {"product": str(product.id), "quantity": 2}
        api_client.post("/api/v1/cart/", data)

        # Clear the cart
        api_client.delete("/api/v1/cart/")

        # Add the same item again
        data = {"product": str(product.id), "quantity": 3}
        api_client.post("/api/v1/cart/", data)

        # Retrieve cart
        response = api_client.get("/api/v1/cart/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["items"]) == 1
        assert response.data["items"][0]["quantity"] == 3
        assert Decimal(response.data["total"]) == Decimal("75.00")  # 3 * 25.00

    def test_add_item_negative_quantity_returns_400(self, api_client, user, product):
        """Test adding item with negative quantity returns bad request"""
        api_client.force_authenticate(user=user)

        data = {"product": str(product.id), "quantity": -1}
        response = api_client.post("/api/v1/cart/", data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "quantity" in response.data
        assert len(response.data["quantity"]) > 0
