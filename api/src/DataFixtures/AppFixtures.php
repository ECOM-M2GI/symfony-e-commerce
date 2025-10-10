<?php

// src\DataFixtures\AppFixtures.php


namespace App\DataFixtures;


use App\Entity\Book;

use App\Entity\User;

use App\Entity\Product;

use App\Model\CategoryEnum;

use App\Model\ConditionEnum;

use App\Model\DeliveryModeEnum;

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
        for ($i = 0; $i < 20; $i++) {
            $product = new Product();
            $product->setName('Produit ' . $i);
            $product->setPrice(mt_rand(1000, 20000) / 100);
            $product->setStockQuantity(mt_rand(0, 100));
            $product->setIsActive((bool)mt_rand(0, 1));
            $product->setImageUrl('https://placehold.co/600x400');
            
            // Ajouter des enums aléatoirement
            $categories = CategoryEnum::cases();
            $product->setCategory($categories[array_rand($categories)]);
            
            $deliveryModes = DeliveryModeEnum::cases();
            $product->setDeliveryMode($deliveryModes[array_rand($deliveryModes)]);
            
            $conditions = ConditionEnum::cases();
            $product->setProductCondition($conditions[array_rand($conditions)]);

            $product->setOwner($usersList[array_rand($usersList)]); // Assigner un utilisateur aléatoire
            
            $manager->persist($product);
        }

        $manager->flush();
    }
}