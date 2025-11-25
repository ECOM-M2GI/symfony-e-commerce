<?php 
namespace App\Model;

enum StatusEnum: string
{
    case Cart = 'CART';
    case Pending = 'PENDING';
    case Paid = 'PAID';
    case Canceled = 'CANCELED';
    case Completed = 'COMPLETED';
}