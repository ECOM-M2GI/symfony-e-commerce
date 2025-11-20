<?php

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class UserVoter extends Voter
{
    public const EDIT = 'USER_EDIT';
    public const VIEW = 'USER_VIEW';
    public const CREATE = 'USER_CREATE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (in_array($attribute, [self::CREATE]) && $subject === null) {
            return true;
        }
        
        return in_array($attribute, [self::EDIT, self::VIEW])
            && $subject instanceof User;
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
