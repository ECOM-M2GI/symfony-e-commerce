<?php 
namespace App\Model;

enum ConditionEnum: string
{
    case New = 'new';
    case LikeNew = 'like_new';
    case Good = 'good';
    case Acceptable = 'acceptable';
}