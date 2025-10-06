<?php 
namespace App\Model;

enum DeliveryModeEnum: string
{
    case HandToHand = 'hand_to_hand';
    case ByMail = 'by_mail';
}