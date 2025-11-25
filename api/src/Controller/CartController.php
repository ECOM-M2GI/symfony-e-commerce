<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Model\StatusEnum;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/v1/cart')]
class CartController extends AbstractController
{
    private const FREE_SHIPPING_THRESHOLD = 49.00;

    public function __construct(
        private EntityManagerInterface $em,
        private OrderRepository $orderRepository,
        private ProductRepository $productRepository,
        private SerializerInterface $serializer
    ) {
    }

    /**
     * Get my cart
     */
    #[Route('', name: 'cart_get', methods: ['GET'])]
    public function getCart(): JsonResponse
    {
        $user = $this->getUser();
        $cart = $this->getOrCreateCart($user);

        return $this->json($this->formatCartResponse($cart));
    }

    /**
     * Add item to cart
     */
    #[Route('', name: 'cart_add_item', methods: ['POST'])]
    public function addItem(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        // Validation
        if (!isset($data['product']) || !isset($data['quantity'])) {
            return $this->json(['detail' => 'product and quantity are required'], Response::HTTP_BAD_REQUEST);
        }

        $productId = $data['product'];
        $quantity = (int) $data['quantity'];

        if ($quantity <= 0) {
            return $this->json(['detail' => 'La quantité doit être strictement positive.'], Response::HTTP_BAD_REQUEST);
        }

        $product = $this->productRepository->find($productId);
        if (!$product) {
            return $this->json(['detail' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$product->isActive()) {
            return $this->json(['detail' => 'Produit inactif'], Response::HTTP_BAD_REQUEST);
        }

        if ($product->getOwner()->getId() === $user->getId()) {
            return $this->json(['detail' => 'u cannot buy ur own product'], Response::HTTP_FORBIDDEN);
        }

        if ($product->getStockQuantity() <= 0) {
            return $this->json(['detail' => 'Produit en rupture de stock.'], Response::HTTP_CONFLICT);
        }

        $cart = $this->getOrCreateCart($user);

        // Check if item already exists in cart
        $existingItem = null;
        foreach ($cart->getOrderItems() as $item) {
            if ($item->getProductId()->getId() === $product->getId()) {
                $existingItem = $item;
                break;
            }
        }

        if ($existingItem) {
            // Update existing item
            $newQuantity = $existingItem->getQuantity() + $quantity;
            if ($newQuantity > $product->getStockQuantity()) {
                return $this->json([
                    'detail' => "Stock insuffisant. Disponible: {$product->getStockQuantity()}"
                ], Response::HTTP_CONFLICT);
            }

            $existingItem->setQuantity($newQuantity);
            $existingItem->setLineTotal((string)((float)$existingItem->getUnitPrice() * $newQuantity));
            $existingItem->setSellerId($product->getOwner()->getId());
            $existingItem->setSellerUsername($product->getOwner()->getUsername());
            $existingItem->setProductCategory($product->getCategory()->value);

            if ($product->getDeliveryMode()->value !== 'hand_to_hand') {
                $existingItem->setProductShippingFee((string)($product->getShippingFee() ?? 0));
            }
        } else {
            // Create new item
            if ($quantity > $product->getStockQuantity()) {
                return $this->json([
                    'detail' => "Stock insuffisant. Disponible: {$product->getStockQuantity()}"
                ], Response::HTTP_CONFLICT);
            }

            $orderItem = new OrderItem();
            $orderItem->setOrderId($cart);
            $orderItem->setProductId($product);
            $orderItem->setProductName($product->getName());
            $orderItem->setUnitPrice($product->getPrice());
            $orderItem->setQuantity($quantity);
            $orderItem->setLineTotal((string)((float)$product->getPrice() * $quantity));
            $orderItem->setSellerId($product->getOwner()->getId());
            $orderItem->setSellerUsername($product->getOwner()->getUsername());
            $orderItem->setProductCategory($product->getCategory()->value);

            if ($product->getDeliveryMode()->value !== 'hand_to_hand') {
                $orderItem->setProductShippingFee((string)($product->getShippingFee() ?? 0));
            }

            $cart->addOrderItem($orderItem);
            $this->em->persist($orderItem);
        }

        // Update cart total (subtotal only)
        $total = 0;
        foreach ($cart->getOrderItems() as $item) {
            $total += (float)$item->getLineTotal();
        }
        $cart->setTotal((string)$total);

        $this->em->flush();

        return $this->json($this->formatCartResponse($cart));
    }

    /**
     * Update item quantity in cart
     */
    #[Route('/items/{productId}', name: 'cart_update_item', methods: ['PATCH'])]
    public function updateItem(string $productId, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['quantity'])) {
            return $this->json(['detail' => 'quantity is required'], Response::HTTP_BAD_REQUEST);
        }

        $quantity = (int) $data['quantity'];

        if ($quantity <= 0) {
            return $this->json(['detail' => 'La quantité doit être strictement positive.'], Response::HTTP_BAD_REQUEST);
        }

        $product = $this->productRepository->find($productId);
        if (!$product) {
            return $this->json(['detail' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$product->isActive()) {
            return $this->json(['detail' => 'Produit inactif'], Response::HTTP_BAD_REQUEST);
        }

        if ($quantity > $product->getStockQuantity()) {
            return $this->json([
                'detail' => "Stock insuffisant. Disponible: {$product->getStockQuantity()}"
            ], Response::HTTP_CONFLICT);
        }

        $cart = $this->getOrCreateCart($user);

        $item = null;
        foreach ($cart->getOrderItems() as $orderItem) {
            if ($orderItem->getProductId()->getId() === $product->getId()) {
                $item = $orderItem;
                break;
            }
        }

        if (!$item) {
            return $this->json(['detail' => 'Item not found in cart'], Response::HTTP_NOT_FOUND);
        }

        $item->setQuantity($quantity);
        $item->setLineTotal((string)((float)$item->getUnitPrice() * $quantity));

        // Update cart total
        $total = 0;
        foreach ($cart->getOrderItems() as $orderItem) {
            $total += (float)$orderItem->getLineTotal();
        }
        $cart->setTotal((string)$total);

        $this->em->flush();

        return $this->json($this->formatCartResponse($cart));
    }

    /**
     * Remove item from cart
     */
    #[Route('/items/{productId}', name: 'cart_remove_item', methods: ['DELETE'])]
    public function removeItem(string $productId): JsonResponse
    {
        $user = $this->getUser();

        $product = $this->productRepository->find($productId);
        if (!$product) {
            return $this->json(['detail' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $cart = $this->getOrCreateCart($user);

        $item = null;
        foreach ($cart->getOrderItems() as $orderItem) {
            if ($orderItem->getProductId()->getId() === $product->getId()) {
                $item = $orderItem;
                break;
            }
        }

        if (!$item) {
            return $this->json(['detail' => 'Item not found in cart'], Response::HTTP_NOT_FOUND);
        }

        $cart->removeOrderItem($item);
        $this->em->remove($item);

        // Update cart total
        $total = 0;
        foreach ($cart->getOrderItems() as $orderItem) {
            $total += (float)$orderItem->getLineTotal();
        }
        $cart->setTotal((string)$total);

        $this->em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Clear cart
     */
    #[Route('', name: 'cart_clear', methods: ['DELETE'])]
    public function clearCart(): JsonResponse
    {
        $user = $this->getUser();
        $cart = $this->orderRepository->findOneBy(['user_id' => $user, 'status' => StatusEnum::Cart]);

        if ($cart) {
            foreach ($cart->getOrderItems() as $item) {
                $this->em->remove($item);
            }
            $cart->setTotal('0');
            $this->em->flush();
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Pay cart (finalize order)
     */
    #[Route('/pay', name: 'cart_pay', methods: ['POST'])]
    public function payCart(): JsonResponse
    {
        $user = $this->getUser();
        $cart = $this->orderRepository->findOneBy(['user_id' => $user, 'status' => StatusEnum::Cart]);

        if (!$cart || $cart->getOrderItems()->count() === 0) {
            return $this->json(['detail' => 'Cart is empty'], Response::HTTP_CONFLICT);
        }

        try {
            $this->em->getConnection()->beginTransaction();

            // Lock and validate all products
            foreach ($cart->getOrderItems() as $item) {
                $product = $this->em->find(Product::class, $item->getProductId()->getId(), \Doctrine\DBAL\LockMode::PESSIMISTIC_WRITE);

                if (!$product->isActive() || $product->getStockQuantity() < $item->getQuantity()) {
                    throw new \Exception("Stock insuffisant pour {$product->getName()}");
                }

                // Decrement stock
                $product->setStockQuantity($product->getStockQuantity() - $item->getQuantity());
            }

            // Compute totals
            $subtotal = 0;
            $shippingTotal = 0;

            foreach ($cart->getOrderItems() as $item) {
                $subtotal += (float)$item->getLineTotal();
                if ($item->getProductShippingFee()) {
                    $shippingTotal += (float)$item->getProductShippingFee();
                }
            }

            if ($subtotal >= self::FREE_SHIPPING_THRESHOLD) {
                $shippingTotal = 0;
            }

            $grandTotal = $subtotal + $shippingTotal;

            // Update cart
            $cart->setTotal((string)$grandTotal);
            $cart->setStatus(StatusEnum::Paid);

            $this->em->flush();
            $this->em->getConnection()->commit();

            return $this->json($this->formatCartResponse($cart));
        } catch (\Exception $e) {
            $this->em->getConnection()->rollback();
            return $this->json(['detail' => $e->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    /**
     * Get or create cart for user
     */
    private function getOrCreateCart($user): Order
    {
        $cart = $this->orderRepository->findOneBy(['user_id' => $user, 'status' => StatusEnum::Cart]);

        if (!$cart) {
            $cart = new Order();
            $cart->setUserId($user);
            $cart->setStatus(StatusEnum::Cart);
            $cart->setTotal('0');
            $this->em->persist($cart);
            $this->em->flush();
        }

        return $cart;
    }

    /**
     * Format cart response with computed fields
     */
    private function formatCartResponse(Order $cart): array
    {
        $subtotal = 0;
        $shippingTotal = 0;

        $items = [];
        foreach ($cart->getOrderItems() as $item) {
            $subtotal += (float)$item->getLineTotal();
            if ($item->getProductShippingFee()) {
                $shippingTotal += (float)$item->getProductShippingFee();
            }

            $items[] = [
                'product_id' => $item->getProductId()->getId(),
                'product_name' => $item->getProductName(),
                'condition' => $item->getProductId()->getProductCondition()->value,
                'product_image_url' => $item->getProductId()->getImageUrl(),
                'unit_price' => $item->getUnitPrice(),
                'quantity' => $item->getQuantity(),
                'line_total' => $item->getLineTotal(),
                'current_stock' => $item->getProductId()->getStockQuantity(),
                'seller_id' => $item->getSellerId(),
                'seller_username' => $item->getSellerUsername(),
                'product_shipping_fee' => $item->getProductShippingFee(),
                'product_category' => $item->getProductCategory(),
                'delivery_mode' => $item->getProductId()->getDeliveryMode()->value,
            ];
        }

        if ($subtotal >= self::FREE_SHIPPING_THRESHOLD) {
            $shippingTotal = 0;
        }

        $grandTotal = $subtotal + $shippingTotal;

        return [
            'id' => $cart->getId(),
            'status' => $cart->getStatus()->value,
            'total' => $cart->getTotal(),
            'subtotal' => number_format($subtotal, 2, '.', ''),
            'shipping_total' => number_format($shippingTotal, 2, '.', ''),
            'grand_total' => number_format($grandTotal, 2, '.', ''),
            'free_shipping_threshold' => number_format(self::FREE_SHIPPING_THRESHOLD, 2, '.', ''),
            'created_at' => $cart->getCreatedAt()->format('c'),
            'updated_at' => $cart->getUpdatedAt()->format('c'),
            'items' => $items,
        ];
    }
}
