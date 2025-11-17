<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\UserRepository;
use App\Security\Voter\ProductVoter;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Core\Security;

final class ProductController extends AbstractController
{
    #[Route('/v1/products', name: 'app_product', methods: ['GET'])]
    #[IsGranted(ProductVoter::LIST, subject: null)]
    public function getAll(Request $request, ProductRepository $productRepository, SerializerInterface $serializer): JsonResponse
    {
        // Récupérer les paramètres de recherche et filtres
        $name = $request->query->get('name');
        $category = $request->query->get('category');
        $deliveryMode = $request->query->get('delivery_mode');
        $condition = $request->query->get('condition');
        $priceMin = $request->query->get('price_min') ? (float) $request->query->get('price_min') : null;
        $priceMax = $request->query->get('price_max') ? (float) $request->query->get('price_max') : null;
        $inStock = $request->query->get('in_stock') === 'true';
        $isActive = $request->query->get('is_active');
        $ordering = $request->query->get('ordering', '-created_at');
        $popular = $request->query->get('popular') ? (int) $request->query->get('popular') : 0;

        // Construire la requête avec les filtres
        $queryBuilder = $productRepository->createQueryBuilder('p');

        // === RECHERCHE PAR NOM/DESCRIPTION ===
        if (!empty($name)) {
            $queryBuilder
                ->andWhere('p.name LIKE :name OR p.description LIKE :name')
                ->setParameter('name', '%' . $name . '%');
        }

        // === FILTRES PAR CATÉGORIE ===
        if (!empty($category)) {
            $queryBuilder
                ->andWhere('p.category = :category')
                ->setParameter('category', $category);
        }

        // === FILTRE PAR MODE DE LIVRAISON ===
        if (!empty($deliveryMode)) {
            $queryBuilder
                ->andWhere('p.delivery_mode = :deliveryMode')
                ->setParameter('deliveryMode', $deliveryMode);
        }

        // === FILTRE PAR CONDITION ===
        if (!empty($condition)) {
            $queryBuilder
                ->andWhere('p.product_condition = :condition')
                ->setParameter('condition', $condition);
        }

        // === FILTRES PAR PRIX ===
        if ($priceMin !== null) {
            $queryBuilder
                ->andWhere('p.price >= :priceMin')
                ->setParameter('priceMin', $priceMin);
        }

        if ($priceMax !== null) {
            $queryBuilder
                ->andWhere('p.price <= :priceMax')
                ->setParameter('priceMax', $priceMax);
        }

        // === FILTRE STOCK DISPONIBLE ===
        if ($inStock) {
            $queryBuilder->andWhere('p.stock_quantity > 0');
        }

        // === GESTION DE LA VISIBILITÉ (is_active) ===
        // Par défaut, ne montrer que les produits actifs
        if ($isActive === 'true') {
            $queryBuilder->andWhere('p.is_active = true');
        } elseif ($isActive === 'false') {
            $queryBuilder->andWhere('p.is_active = false');
        } else {
            // Si pas spécifié, montrer seulement les actifs (sécurité)
            $queryBuilder->andWhere('p.is_active = true');
        }

        // === TRI (avec whitelist pour sécurité) ===
        $allowedOrderings = [
            'created_at' => 'p.created_at ASC',
            '-created_at' => 'p.created_at DESC',
            'price' => 'p.price ASC',
            '-price' => 'p.price DESC',
            'name' => 'p.name ASC',
            '-name' => 'p.name DESC',
            'stock_quantity' => 'p.stock_quantity ASC',
            '-stock_quantity' => 'p.stock_quantity DESC'
        ];

        $orderBy = $allowedOrderings[$ordering] ?? $allowedOrderings['created_at'];
        [$field, $direction] = explode(' ', $orderBy);
        $queryBuilder->orderBy($field, $direction);

        // Exécuter la requête
        $products = $queryBuilder->getQuery()->getResult();

        // === GESTION DU MODE "POPULAIRE" (sélection aléatoire) ===
        if ($popular > 0 && !empty($products)) {
            $totalProducts = count($products);
            $numberOfItems = min($popular, $totalProducts);
            
            // Sélection aléatoire
            $randomKeys = array_rand($products, $numberOfItems);
            if (!is_array($randomKeys)) {
                $randomKeys = [$randomKeys];
            }
            
            $popularProducts = [];
            foreach ($randomKeys as $key) {
                $popularProducts[] = $products[$key];
            }
            $products = $popularProducts;
        }

        // Sérialiser et retourner
        $context = ['groups' => ['product:read']];
        $jsonProducts = $serializer->serialize($products, 'json', $context);
        return new JsonResponse($jsonProducts, Response::HTTP_OK, [], true);
    }
    #[Route('/v1/products/from-owner', name: 'app_product_from_owner', methods: ['GET'])]
    #[IsGranted(ProductVoter::LIST_FROM_OWNER, subject: null)]
    public function getAllFromOwner(ProductRepository $productRepository, SerializerInterface $serializer): JsonResponse
    {
        // Récupérer l'utilisateur connecté depuis le token JWT
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $queryBuilder = $productRepository->createQueryBuilder('p')
            ->andWhere('p.owner = :user')
            ->setParameter('user', $user)
            ->orderBy('p.created_at', 'DESC');

        // Exécuter la requête
        $products = $queryBuilder->getQuery()->getResult();

        // Sérialiser et retourner
        $context = ['groups' => ['product:read']];
        $jsonProducts = $serializer->serialize($products, 'json', $context);
        return new JsonResponse($jsonProducts, Response::HTTP_OK, [], true);
    }

    #[Route('/v1/products/{id}', name: 'app_product_search_by_id', methods: ['GET'])]
    #[IsGranted(ProductVoter::VIEW, subject: 'product')]
    public function findById(Product $product, SerializerInterface $serializer): JsonResponse
    {
        $context = ['groups' => ['product:read']];
        $jsonProduct = $serializer->serialize($product, 'json', $context);

        return new JsonResponse($jsonProduct, Response::HTTP_OK, [], true);
    }

    #[Route('v1/products/{id}', name: 'app_product_delete', methods: ['DELETE'])]
    #[IsGranted(ProductVoter::EDIT, subject: 'product')]
    public function deleteById(Product $product, EntityManagerInterface $em): JsonResponse {
        
        $em->remove($product);
        $em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/v1/products', name: 'app_product_add', methods: ['POST'])]
    #[IsGranted(ProductVoter::CREATE, subject: null)]
    public function add(Request $request, SerializerInterface $serializer, EntityManagerInterface $em, 
    UrlGeneratorInterface $urlGenerator, UserRepository $userRepository, ValidatorInterface $validator): JsonResponse
    {
        $data = $request->getContent();
        $product = $serializer->deserialize($data, Product::class, 'json');

        $content = $request->toArray();

        $errors = $validator->validate($product);
        if (count($errors) > 0) {
            // Format des erreurs pour le debugging
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = [
                    'property' => $error->getPropertyPath(),
                    'message' => $error->getMessage(),
                ];
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $ownerName = $this->getUser()->getUserIdentifier();
        if ($ownerName) {
            $product->setOwner($this->getUser());
        } else {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $em->persist($product);
        $em->flush();

        $context = ['groups' => ['product:read']];
        $jsonProduct = $serializer->serialize($product, 'json', $context);

        $location = $urlGenerator->generate('app_product_search_by_id', ['id' => $product->getId()], UrlGeneratorInterface::ABSOLUTE_URL);

        return new JsonResponse($jsonProduct, Response::HTTP_CREATED, ["Location" => $location], true);
    }

    #[Route('/v1/products/{id}', name: 'app_product_patch', methods: ['PATCH'])]
    #[IsGranted(ProductVoter::EDIT, subject: 'product')]
    public function patch(Request $request, SerializerInterface $serializer, Product $product, EntityManagerInterface $em): JsonResponse 
    {
        $patchedProduct = $serializer->deserialize($request->getContent(),
                Product::class, 
                'json', 
                [AbstractNormalizer::OBJECT_TO_POPULATE => $product]);

        $em->persist($patchedProduct);
        $em->flush();
        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}