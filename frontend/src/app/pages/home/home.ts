import { Component, inject } from '@angular/core';
import { ProductsLineList } from '@app/components/products-line-list/products-line-list';
import { CarouselComponent, Slide } from '@app/components/carousel/carousel.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ProductsLineList, CarouselComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private router = inject(Router);

  slides: Slide[] = [
    {
      id: 1,
      title: 'Achetez en mains propres et faites de nouvelles connaissances',
      subtitle: 'Les mamies du banc valident !',
      cta: 'Achetez dès maintenant',
      img: 'img/voisines.png',
      bg: 'bg-[#22c55e]',
    },
    {
      id: 2,
      title: 'iPhone 15 Pro – reprise boostée',
      subtitle: 'Bonus fidélité +50€ ce mois-ci. On reprend même vos câbles emmêlés.',
      cta: 'Estimer mon iPhone',
      img: 'img/iphone.png',
      bg: 'bg-[#597ba8]',
    },
    {
      id: 3,
      title: 'Coup de main au jardin',
      subtitle: 'On plante, on arrose, on papote : vos tomates n’ont jamais été aussi sociales.',
      cta: 'Voir l’entraide jardin',
      img: 'img/scie.png',
      bg: 'bg-[#e4ebf5]',
    },
  ];

  onCta(slide: Slide) {

    switch (slide.id) {
      case 1:
        this.router.navigate(['/products']);
        break;
      case 2:
        this.router.navigate(['/products'], {
          queryParams: { category: 'appliances' },
          queryParamsHandling: 'merge',
        });
        break;
      case 3:
        this.router.navigate(['/products'], {
          queryParams: { category: 'home' },
          queryParamsHandling: 'merge',
        });
        break;
    }
  }
}
