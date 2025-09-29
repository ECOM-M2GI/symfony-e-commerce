<?php

// src\DataFixtures\AppFixtures.php


namespace App\DataFixtures;


use App\Entity\Book;

use App\Entity\Product;

use App\Model\CategoryEnum;

use App\Model\DeliveryModeEnum;

use App\Model\ConditionEnum;

use Doctrine\Persistence\ObjectManager;

use Doctrine\Bundle\FixturesBundle\Fixture;

class AppFixtures extends Fixture

{
    public function load(ObjectManager $manager): void
    {
        // Création d'une vingtaine de produits
        for ($i = 0; $i < 20; $i++) {
            $product = new Product();
            $product->setUserId($i + 1);
            $product->setName('Produit ' . $i);
            $product->setPrice(mt_rand(1000, 20000) / 100);
            $product->setStockQuantity(mt_rand(0, 100));
            $product->setIsActive((bool)mt_rand(0, 1));
            
            // Ajouter des enums aléatoirement
            $categories = CategoryEnum::cases();
            $product->setCategory($categories[array_rand($categories)]);
            
            $deliveryModes = DeliveryModeEnum::cases();
            $product->setDeliveryMode($deliveryModes[array_rand($deliveryModes)]);
            
            $conditions = ConditionEnum::cases();
            $product->setProductCondition($conditions[array_rand($conditions)]);
            
            $manager->persist($product);
        }

        $manager->flush();
    }
}