<?php

namespace App\Controller;

use App\Repository\ProductRepository;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\Response;

final class ProductController extends AbstractController
{
    #[Route('/v1/products', name: 'app_product')]
    public function getAll(ProductRepository $productRepository, SerializerInterface $serializer): JsonResponse
    {
        $productsList = $productRepository->findAll();
        $jsonProductsList = $serializer->serialize($productsList, 'json');

        return new JsonResponse($jsonProductsList, Response::HTTP_OK, [], true);
    }
}