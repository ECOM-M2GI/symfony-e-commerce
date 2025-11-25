<?php

// src\DataFixtures\AppFixtures.php


namespace App\DataFixtures;


use App\Entity\Book;

use App\Entity\User;

use App\Entity\Product;

use App\Entity\Order;

use App\Entity\OrderItem;

use App\Model\CategoryEnum;

use App\Model\ConditionEnum;

use App\Model\DeliveryModeEnum;

use App\Model\StatusEnum;

use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture

{
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;

    }

    public function load(ObjectManager $manager): void
    {
        $usersList = [];

        // Création de 5 users
        for ($i = 0; $i < 5; $i++) {
            $user = new User();
            $user->setUsername('user' . $i);
            $user->setEmail('user' . $i . '@example.com');
            $user->setPassword($this->passwordHasher->hashPassword($user, 'password' . $i));
            $user->setFirstName('User' . $i);
            $user->setLastName('LastName' . $i);
            $user->setPhoneNumber('012345678' . $i);
            $year = mt_rand(1970, 2005);
            $month = mt_rand(1, 12);
            $day = mt_rand(1, 28); // Pour éviter les problèmes de jours invalides
            $user->setDateOfBirth(new \DateTime("$year-$month-$day"));
            $user->setAdress('123 Main St, City ' . $i);

            $usersList[] = $user; // Stocker l'utilisateur dans la liste
            $manager->persist($user);
        }

        // Création d'une vingtaine de produits
        $productsList = [];
        for ($i = 0; $i < 50; $i++) {
            $product = new Product();
            $product->setName('Produit ' . $i);
            $product->setPrice(mt_rand(1000, 20000) / 100);
            $product->setStockQuantity(mt_rand(5, 100)); // Au moins 5 en stock
            $product->setIsActive(true); // Tous actifs pour faciliter les tests
            $product->setImageUrl('https://placehold.co/600x400');
            
            // Ajouter des enums aléatoirement
            $categories = CategoryEnum::cases();
            $product->setCategory($categories[array_rand($categories)]);
            
            $deliveryModes = DeliveryModeEnum::cases();
            $product->setDeliveryMode($deliveryModes[array_rand($deliveryModes)]);
            
            $conditions = ConditionEnum::cases();
            $product->setProductCondition($conditions[array_rand($conditions)]);

            $product->setOwner($usersList[array_rand($usersList)]); // Assigner un utilisateur aléatoire
            
            $productsList[] = $product; // Stocker le produit dans la liste
            $manager->persist($product);
        }

        // Création de commandes avec des items
        for ($i = 0; $i < 15; $i++) {
            $order = new Order();
            $buyer = $usersList[array_rand($usersList)];
            $order->setUserId($buyer);
            
            // Définir le statut aléatoirement
            $statuses = StatusEnum::cases();
            $order->setStatus($statuses[array_rand($statuses)]);
            
            // Ajouter entre 1 et 4 items à chaque commande
            $itemCount = mt_rand(1, 4);
            $orderTotal = 0;
            $usedProductIndexes = []; // Pour éviter les doublons dans une commande
            
            for ($j = 0; $j < $itemCount; $j++) {
                // Essayer de trouver un produit valide (pas du même propriétaire, pas déjà utilisé)
                $attempts = 0;
                $productIndex = null;
                do {
                    $productIndex = array_rand($productsList);
                    $product = $productsList[$productIndex];
                    $attempts++;
                } while (($product->getOwner() === $buyer || in_array($productIndex, $usedProductIndexes)) && $attempts < 20);
                
                // Si on n'arrive pas à trouver un produit valide, passer au suivant
                if ($attempts >= 20) {
                    continue;
                }
                
                $usedProductIndexes[] = $productIndex;
                
                $orderItem = new OrderItem();
                $orderItem->setOrderId($order);
                $orderItem->setProductId($product);
                $orderItem->setProductName($product->getName());
                $orderItem->setUnitPrice($product->getPrice());
                
                $quantity = mt_rand(1, min(3, $product->getStockQuantity()));
                $orderItem->setQuantity($quantity);
                
                $lineTotal = (float)$product->getPrice() * $quantity;
                $orderItem->setLineTotal((string)$lineTotal);
                $orderTotal += $lineTotal;
                
                // Ajouter les informations du vendeur
                $orderItem->setSellerId($product->getOwner()->getId());
                $orderItem->setSellerUsername($product->getOwner()->getUsername());
                $orderItem->setProductCategory($product->getCategory()->value);
                
                // Ajouter les frais de livraison si applicable
                if ($product->getDeliveryMode() !== DeliveryModeEnum::HandToHand) {
                    $orderItem->setProductShippingFee((string)mt_rand(300, 1500) / 100);
                }
                
                $order->addOrderItem($orderItem);
            }
            
            // Définir le total de la commande
            $order->setTotal((string)$orderTotal);
            
            // Persister l'order avec ses items
            $manager->persist($order);
        }

        $manager->flush();
    }
}