<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

final class UserController extends AbstractController
{
    #[Route('/v1/users', name: 'app_user', methods: ['GET'])]
    public function getAll(UserRepository $userRepository, SerializerInterface $serializer): JsonResponse
    {
        $users = $userRepository->findAll();
        $context = ['groups' => ['user:read']];
        $jsonProduct = $serializer->serialize($users, 'json', $context);

        return new JsonResponse($jsonProduct, Response::HTTP_OK, [], true);
    }

    #[Route('/v1/users/{id}', name: 'app_user_by_id', methods: ['GET'])]
    public function findById(User $user, SerializerInterface $serializer): JsonResponse
    {
        $context = ['groups' => ['user:read']];
        $jsonUser = $serializer->serialize($user, 'json', $context);

        return new JsonResponse($jsonUser, Response::HTTP_OK, [], true);
    }
    
}
