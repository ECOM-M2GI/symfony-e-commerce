<?php

namespace App\Entity;

use App\Repository\OrderItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderItemRepository::class)]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    private ?string $product_name = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $unit_price = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $line_total = null;

    #[ORM\Column(nullable: true)]
    private ?int $quantity = null;

    #[ORM\Column(nullable: true)]
    private ?int $seller_id = null;

    #[ORM\Column(length: 150, nullable: true)]
    private ?string $seller_username = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $product_shipping_fee = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $product_category = null;

    #[ORM\ManyToOne(inversedBy: 'orderItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Order $order_id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product_id = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProductName(): ?string
    {
        return $this->product_name;
    }

    public function setProductName(string $product_name): static
    {
        $this->product_name = $product_name;

        return $this;
    }

    public function getUnitPrice(): ?string
    {
        return $this->unit_price;
    }

    public function setUnitPrice(string $unit_price): static
    {
        $this->unit_price = $unit_price;

        return $this;
    }

    public function getLineTotal(): ?string
    {
        return $this->line_total;
    }

    public function setLineTotal(string $line_total): static
    {
        $this->line_total = $line_total;

        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(?int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getSellerId(): ?int
    {
        return $this->seller_id;
    }

    public function setSellerId(?int $seller_id): static
    {
        $this->seller_id = $seller_id;

        return $this;
    }

    public function getSellerUsername(): ?string
    {
        return $this->seller_username;
    }

    public function setSellerUsername(?string $seller_username): static
    {
        $this->seller_username = $seller_username;

        return $this;
    }

    public function getProductShippingFee(): ?string
    {
        return $this->product_shipping_fee;
    }

    public function setProductShippingFee(?string $product_shipping_fee): static
    {
        $this->product_shipping_fee = $product_shipping_fee;

        return $this;
    }

    public function getProductCategory(): ?string
    {
        return $this->product_category;
    }

    public function setProductCategory(?string $product_category): static
    {
        $this->product_category = $product_category;

        return $this;
    }

    public function getOrderId(): ?Order
    {
        return $this->order_id;
    }

    public function setOrderId(?Order $order_id): static
    {
        $this->order_id = $order_id;

        return $this;
    }

    public function getProductId(): ?Product
    {
        return $this->product_id;
    }

    public function setProductId(?Product $product_id): static
    {
        $this->product_id = $product_id;

        return $this;
    }
}
