<?php 
namespace App\Model;

enum CategoryEnum: string
{
    case Clothes = 'clothes';
    case Books = 'books';
    case Cars = 'cars';
    case VideoGames = 'video_games';
    case Sport = 'sport';
    case Home = 'home';
    case Appliances = 'appliances';
}