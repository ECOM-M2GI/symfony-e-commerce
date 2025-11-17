<?php 
namespace App\Model;

enum StatusEnum: string
{
    case Cart = 'cart';
    case Pending = 'pending';
    case Paid = 'paid';
    case Canceled = 'canceled';
    case Completed = 'completed';
}