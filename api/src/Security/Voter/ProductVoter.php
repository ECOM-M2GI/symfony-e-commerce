<?php

namespace App\Security\Voter;

use App\Entity\Product;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class ProductVoter extends Voter
{
    public const EDIT = 'PRODUCT_EDIT';
    public const VIEW = 'PRODUCT_VIEW';
    public const LIST_FROM_OWNER = 'PRODUCT_LIST_FROM_OWNER';
    public const LIST = 'PRODUCT_LIST';
    public const CREATE = 'PRODUCT_CREATE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (in_array($attribute, [self::LIST, self::LIST_FROM_OWNER, self::CREATE]) && $subject === null) {
            return true;
        }
        
        return in_array($attribute, [self::EDIT, self::VIEW])
            && $subject instanceof Product;
    }

    /**
     * @param Product|null $subject
     */
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        // PUBLIC ACCESS
        if($attribute === self::LIST || $attribute === self::VIEW) {
            return true;
        }

        if (!$user instanceof UserInterface) {
            return false;
        }

        switch ($attribute) {
            case self::LIST_FROM_OWNER:
            case self::CREATE:
                return true;

            case self::EDIT:
                return $subject->getOwner()->getUserIdentifier() === $user->getUserIdentifier();
        }

        return false;
    }
}
