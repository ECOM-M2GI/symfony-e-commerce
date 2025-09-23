import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

export interface Slide {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  cta?: string;
  bg?: string; // np. 'bg-[#22c55e]' lub 'bg-neutral-900'
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="relative rounded-2xl w-full overflow-hidden"
       [ngClass]="slides[currentIndex].bg || 'bg-[#22c55e]'"
       (mouseenter)="pause()" (mouseleave)="resume()" role="region"
       aria-roledescription="carousel" aria-label="Promocje">

    <!-- SLIDES -->
    <div class="flex transition-transform duration-700 ease-in-out"
         [style.transform]="'translateX(-' + currentIndex * 100 + '%)'">
      <div *ngFor="let s of slides; let i = index; trackBy: trackByIndex" class="w-full shrink-0">
        <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-6 p-6 md:p-10">
          <div class="text-neutral-900">
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
              {{ s.title }}
            </h2>
            <p class="mt-2 md:mt-3 text-neutral-800/90">
              {{ s.subtitle }}
            </p>
            <button *ngIf="s.cta" type="button"
              class="inline-flex items-center rounded-full bg-neutral-900 text-white px-6 py-3 mt-6 text-sm font-medium hover:bg-neutral-800"
              (click)="onCtaClick(s)">
              {{ s.cta }}
            </button>
          </div>

          <div class="flex items-end justify-center gap-8 ">
            <img [src]="s.img" [alt]="'Slide ' + (i+1)" loading="lazy"
                 class="h-52 md:h-64 object-contain rounded-2xl " />
          </div>
        </div>
      </div>
    </div>

    <!-- arrows -->
    <button type="button" aria-label="Poprzedni slajd"
      class="absolute right-16 bottom-4 md:bottom-6 grid place-items-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/70"
      (click)="prev()">❮</button>
    <button type="button" aria-label="Następny slajd"
      class="absolute right-4 bottom-4 md:bottom-6 grid place-items-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/70"
      (click)="next()">❯</button>

    <!-- dots -->
    <div class="absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-6 flex gap-2">
      <button *ngFor="let _ of slides; let i = index"
        class="h-2.5 w-2.5 rounded-full"
        [class.bg-white]="i===currentIndex"
        [class.bg-white/50]="i!==currentIndex"
        (click)="go(i)"
        [attr.aria-label]="'Idź do slajdu ' + (i+1)"></button>
    </div>
  </div>
  `,
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input({ required: true }) slides: Slide[] = [];
  @Input() interval = 5000; // ms
  @Input() autoPlay = true;
  @Input() pauseOnHover = true;

  @Output() cta = new EventEmitter<Slide>();

  currentIndex = 0;
  private t?: any;

  ngOnInit() {
    this.start();
  }
  ngOnDestroy() {
    this.clear();
  }

  // autoplay
  private start() {
    this.clear();
    if (this.autoPlay && this.slides?.length > 1) {
      this.t = setInterval(() => this.next(), this.interval);
    }
  }
  private clear() {
    if (this.t) {
      clearInterval(this.t);
      this.t = undefined;
    }
  }
  private resetTimer() {
    if (this.autoPlay) {
      this.start();
    }
  }

  next() {
    if (!this.slides?.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.resetTimer();
  }
  prev() {
    if (!this.slides?.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.resetTimer();
  }
  go(i: number) {
    if (!this.slides?.length) return;
    this.currentIndex = i;
    this.resetTimer();
  }

  // hover
  pause() {
    if (this.pauseOnHover) this.clear();
  }
  resume() {
    if (this.pauseOnHover) this.start();
  }

  // CTA
  onCtaClick(s: Slide) {
    this.cta.emit(s);
  }

  // trackBy
  trackByIndex = (_: number, __: unknown) => _;
}
