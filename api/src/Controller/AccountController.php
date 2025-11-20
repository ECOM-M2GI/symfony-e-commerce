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

        if(!isset($content['password_confirm']) || $content['password_confirm'] !== $content['password']) {
            return new JsonResponse(['errors' => ['password_confirm' => 'La confirmation du mot de passe ne correspond pas.']], Response::HTTP_BAD_REQUEST);
        }

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
}
