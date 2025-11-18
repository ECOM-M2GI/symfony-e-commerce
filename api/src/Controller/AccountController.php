<?php

namespace App\Controller;

use App\Entity\User;
use App\Model\StatusEnum;
use App\Repository\OrderItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

final class AccountController extends AbstractController
{
    #[Route('/v1/accounts/register', name: 'register_user', methods: ['POST'])]
    public function add(Request $request, SerializerInterface $serializer, EntityManagerInterface $em, 
    ValidatorInterface $validator, JWTTokenManagerInterface $JWTManager): JsonResponse
    {
        $data = $request->getContent();
        $user = $serializer->deserialize($data, User::class, 'json');

        $content = $request->toArray();

        $errors = $validator->validate($user);
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

        $em->persist($user);
        $em->flush();

        $context = ['groups' => ['user:write']];
        $jsonUser = $serializer->serialize($user, 'json', $context);

        return new JsonResponse(['token' => $JWTManager->create($user)]);
    }

    #[Route('v1/user', name: 'user_own_profile', methods: ['GET'])]
    public function getOwnProfile(SerializerInterface $serializer): JsonResponse
    {
        $user = $this->getUser();
        $context = ['groups' => ['user:read']];
        $jsonUser = $serializer->serialize($user, 'json', $context);

        return new JsonResponse($jsonUser, Response::HTTP_OK, [], true);
    }

    #[Route('/v1/user/purchases', name: 'user_purchase_history', methods: ['GET'])]
    public function getPurchaseHistory(OrderItemRepository $orderItemRepository): JsonResponse
    {
        $user = $this->getUser();
        
        // Récupérer tous les OrderItems où l'utilisateur est l'acheteur et le statut est 'paid'
        $orderItems = $orderItemRepository->createQueryBuilder('oi')
            ->innerJoin('oi.order_id', 'o')
            ->innerJoin('oi.product_id', 'p')
            ->innerJoin('p.owner', 'seller')
            ->where('o.user_id = :user')
            ->andWhere('o.status = :status')
            ->setParameter('user', $user)
            ->setParameter('status', StatusEnum::Paid)
            ->orderBy('o.updated_at', 'DESC')
            ->addOrderBy('o.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $purchaseHistory = [];
        foreach ($orderItems as $orderItem) {
            $purchaseHistory[] = [
                'order_id' => $orderItem->getOrderId()->getId(),
                'product_id' => $orderItem->getProductId()->getId(),
                'product_name' => $orderItem->getProductName(),
                'unit_price' => $orderItem->getUnitPrice(),
                'quantity' => $orderItem->getQuantity(),
                'line_total' => $orderItem->getLineTotal(),
                'seller_username' => $orderItem->getProductId()->getOwner()->getUsername(),
                'status' => $orderItem->getOrderId()->getStatus()->value,
                'updated_at' => $orderItem->getOrderId()->getUpdatedAt()->format('c'),
                'product_image_url' => $orderItem->getProductId()->getImageUrl()
            ];
        }

        return new JsonResponse($purchaseHistory, Response::HTTP_OK);
    }

    #[Route('/v1/user/sales', name: 'user_sales_history', methods: ['GET'])]
    public function getSalesHistory(OrderItemRepository $orderItemRepository): JsonResponse
    {
        $user = $this->getUser();
        
        // Récupérer tous les OrderItems où l'utilisateur est le vendeur (owner du produit) et le statut est 'paid'
        $orderItems = $orderItemRepository->createQueryBuilder('oi')
            ->innerJoin('oi.order_id', 'o')
            ->innerJoin('oi.product_id', 'p')
            ->innerJoin('o.user_id', 'buyer')
            ->where('p.owner = :user')
            ->andWhere('o.status = :status')
            ->setParameter('user', $user)
            ->setParameter('status', StatusEnum::Paid)
            ->orderBy('o.updated_at', 'DESC')
            ->addOrderBy('o.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $salesHistory = [];
        foreach ($orderItems as $orderItem) {
            $salesHistory[] = [
                'order_id' => $orderItem->getOrderId()->getId(),
                'product_id' => $orderItem->getProductId()->getId(),
                'product_name' => $orderItem->getProductName(),
                'unit_price' => $orderItem->getUnitPrice(),
                'quantity' => $orderItem->getQuantity(),
                'line_total' => $orderItem->getLineTotal(),
                'buyer_username' => $orderItem->getOrderId()->getUserId()->getUsername(),
                'status' => $orderItem->getOrderId()->getStatus()->value,
                'updated_at' => $orderItem->getOrderId()->getUpdatedAt()->format('c'),
                'product_image_url' => $orderItem->getProductId()->getImageUrl()
            ];
        }

        return new JsonResponse($salesHistory, Response::HTTP_OK);
    }
}
