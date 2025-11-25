<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Wishlist;
use App\Entity\WishlistItem;
use App\Repository\ProductRepository;
use App\Repository\WishlistRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/v1/wishlist')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class WishlistController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private WishlistRepository $wishlistRepository,
        private ProductRepository $productRepository
    ) {
    }

    /**
     * Get wishlist products
     */
    #[Route('', name: 'wishlist_get', methods: ['GET'])]
    public function getWishlist(): JsonResponse
    {
        $user = $this->getUser();
        $wishlist = $this->getOrCreateWishlist($user);

        $products = $this->getWishlistProducts($wishlist);

        return $this->json($products, Response::HTTP_OK, [], ['groups' => ['product:read']]);
    }

    /**
     * Add product to wishlist
     */
    #[Route('', name: 'wishlist_add', methods: ['POST'])]
    public function addToWishlist(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['product'])) {
            return $this->json(['detail' => 'product is required'], Response::HTTP_BAD_REQUEST);
        }

        $productId = $data['product'];
        $product = $this->productRepository->find($productId);

        if (!$product) {
            return $this->json(['detail' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$product->isActive()) {
            return $this->json(['detail' => 'Produit inactif'], Response::HTTP_BAD_REQUEST);
        }

        $wishlist = $this->getOrCreateWishlist($user);

        // Check if product already in wishlist
        $existingItem = null;
        foreach ($wishlist->getWishlistItems() as $item) {
            if ($item->getProductId()->getId() === $product->getId()) {
                $existingItem = $item;
                break;
            }
        }

        if (!$existingItem) {
            $wishlistItem = new WishlistItem();
            $wishlistItem->setWishlistId($wishlist);
            $wishlistItem->setProductId($product);

            $this->em->persist($wishlistItem);
            $this->em->flush();
        }

        // Refresh to get updated items
        $this->em->refresh($wishlist);
        $products = $this->getWishlistProducts($wishlist);

        return $this->json($products, Response::HTTP_OK, [], ['groups' => ['product:read']]);
    }

    /**
     * Remove product from wishlist
     */
    #[Route('', name: 'wishlist_remove', methods: ['DELETE'])]
    public function removeFromWishlist(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $productId = $request->query->get('product');

        if (!$productId) {
            return $this->json(['detail' => 'Paramètre \'product\' requis'], Response::HTTP_BAD_REQUEST);
        }

        $product = $this->productRepository->find($productId);
        if (!$product) {
            return $this->json(['detail' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $wishlist = $this->getOrCreateWishlist($user);

        $itemToRemove = null;
        foreach ($wishlist->getWishlistItems() as $item) {
            if ($item->getProductId()->getId() === $product->getId()) {
                $itemToRemove = $item;
                break;
            }
        }

        if (!$itemToRemove) {
            return $this->json(['detail' => 'Item not found in wishlist'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($itemToRemove);
        $this->em->flush();

        $products = $this->getWishlistProducts($wishlist);

        return $this->json($products, Response::HTTP_OK, [], ['groups' => ['product:read']]);
    }

    /**
     * Get or create wishlist for user
     */
    private function getOrCreateWishlist($user): Wishlist
    {
        $wishlist = $this->wishlistRepository->findOneBy(['user_id' => $user]);

        if (!$wishlist) {
            $wishlist = new Wishlist();
            $wishlist->setUserId($user);
            $this->em->persist($wishlist);
            $this->em->flush();
        }

        return $wishlist;
    }

    /**
     * Get active products from wishlist
     */
    private function getWishlistProducts(Wishlist $wishlist): array
    {
        $products = [];
        foreach ($wishlist->getWishlistItems() as $item) {
            $product = $item->getProductId();
            if ($product && $product->isActive()) {
                $products[] = $product;
            }
        }

        return $products;
    }
}
