<?php

namespace App\Entity;

use App\Repository\ProductRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName;
use App\Model\CategoryEnum;
use App\Model\DeliveryModeEnum;
use App\Model\ConditionEnum;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["product:read"])]
    private ?int $id = null;

    #[ORM\Column(length: 200, nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\NotBlank(message: 'Le nom du produit ne peut pas être vide.')]
    #[Assert\Length(min: 1, max: 200, maxMessage: 'Le nom du produit ne peut pas dépasser {{ limit }} caractères.', minMessage: 'Le nom du produit doit contenir au moins {{ limit }} caractère.')]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(["product:read", "product:write"])]
    private ?string $description = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\NotBlank(message: 'Le prix du produit ne peut pas être vide.')]
    #[Assert\Range(min: 0, notInRangeMessage: 'Le prix du produit ne peut pas être négatif.')]
    private ?string $price = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\NotNull(message: 'La quantité en stock doit être définie.')]
    #[Assert\Range(min: 0, notInRangeMessage: 'La quantité en stock ne peut pas être négative.')]
    private ?int $stock_quantity = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\NotNull(message: 'Le statut actif doit être défini.')]
    private ?bool $is_active = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\Range(min: 0, notInRangeMessage: 'Les frais de livraison ne peuvent pas être négatifs.')]
    private ?string $shipping_fee = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["product:read"])]
    private ?\DateTime $created_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["product:read"])]
    private ?\DateTime $updated_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\NotBlank(message: 'L\'URL de l\'image ne peut pas être vide.')]
    #[Assert\Url(message: 'L\'URL de l\'image n\'est pas valide.')]
    private ?string $image_url = null;

    #[ORM\Column(type: 'string', enumType: DeliveryModeEnum::class, nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\NotBlank(message: 'Le mode de livraison ne peut pas être vide.')]
    private ?DeliveryModeEnum $delivery_mode = null;

    #[ORM\Column(type: 'string', enumType: CategoryEnum::class, nullable: true)]
    #[Groups(["product:read", "product:write"])]
    #[Assert\NotBlank(message: 'La catégorie ne peut pas être vide.')]
    private ?CategoryEnum $category = null;

    #[ORM\Column(type: 'string', enumType: ConditionEnum::class, nullable: true)]
    #[Assert\NotBlank(message: 'Le statut du produit ne peut pas être vide.')]
    #[SerializedName('condition')]
    #[Groups(["product:read", "product:write"])]
    private ?ConditionEnum $product_condition = null;

    #[ORM\ManyToOne(inversedBy: 'products')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $owner = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(?string $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getStockQuantity(): ?int
    {
        return $this->stock_quantity;
    }

    public function setStockQuantity(?int $stock_quantity): static
    {
        $this->stock_quantity = $stock_quantity;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->is_active;
    }

    public function setIsActive(?bool $is_active): static
    {
        $this->is_active = $is_active;

        return $this;
    }

    public function getShippingFee(): ?string
    {
        return $this->shipping_fee;
    }

    public function setShippingFee(?string $shipping_fee): static
    {
        $this->shipping_fee = $shipping_fee;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->created_at;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->created_at = new \DateTime();
        $this->updated_at = new \DateTime();
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updated_at;
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updated_at = new \DateTime();
    }

    public function getImageUrl(): ?string
    {
        return $this->image_url;
    }

    public function setImageUrl(?string $image_url): static
    {
        $this->image_url = $image_url;

        return $this;
    }

    public function getDeliveryMode(): ?DeliveryModeEnum
    {
        return $this->delivery_mode;
    }

    public function setDeliveryMode(?DeliveryModeEnum $delivery_mode): static
    {
        $this->delivery_mode = $delivery_mode;

        return $this;
    }

    public function getCategory(): ?CategoryEnum
    {
        return $this->category;
    }

    public function setCategory(?CategoryEnum $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getProductCondition(): ?ConditionEnum
    {
        return $this->product_condition;
    }

    public function setProductCondition(?ConditionEnum $condition): static
    {
        $this->product_condition = $condition;

        return $this;
    }

    /**
     * Alias pour la désérialisation depuis "condition" 
     */
    public function setCondition(?ConditionEnum $condition): static
    {
        $this->product_condition = $condition;

        return $this;
    }

    public function setCreatedAt(\DateTime $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function setUpdatedAt(\DateTime $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }

    
    #[Groups(["product:read"])]
    #[SerializedName('created_by_username')]
    public function getOwnerUsername(): string
    {
        return $this->owner->getUsername();
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;

        return $this;
    }
}
