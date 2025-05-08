import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { PlatformService } from '../../../../services/platform.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-minimi',
  imports: [TranslateModule, NgFor],
  templateUrl: './minimi.component.html',
  styleUrl: './minimi.component.scss',
  animations: [
    trigger('fadeSlide', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', [animate(MinimiComponent.fadeOutDuration + 'ms ease-out')]),
      transition('hidden => visible', [animate(MinimiComponent.fadeInDuration + 'ms ease-in')]),
    ]),
  ],
})
export class MinimiComponent implements AfterViewInit, OnDestroy {
  public static fadeOutDuration: number = 2000; // Duration for fade-out animation in milliseconds
  public static fadeInDuration: number = 3000; // Duration for fade-in animation in milliseconds
  private intervalValue: number = 8000; // Interval duration in milliseconds (8 seconds)

  private slideSub!: Subscription;

  slides = [
    {
      imageUrl: '/images/church/origins/origins-01.png',
      text: 'The Sanctuary of San Francesco di Paola in Calabria, spiritual heart of the Order of Minims.',
    },
    {
      imageUrl: '/images/church/origins/origins-02.png',
      text: 'The Order of Minims lives in humility, penance, and charity, following the path of their founder.',
    },
    {
      imageUrl: '/images/church/origins/origins-03.png',
      text: 'San Francesco di Paola, a man of miracles and peace, called all to a life of simplicity and love.',
    },
    {
      imageUrl: '/images/church/origins/origins-04.png',
      text: 'In silence and contemplation, the Frati Minimi dedicate their lives to prayer and service.',
    },
  ];

  currentSlideIndex = 0;
  activeSlides: { imageUrl: string; text: string; visible: boolean }[] = [];
  fadeState: 'visible' | 'hidden' = 'visible';

  constructor(private platformService: PlatformService) {}

  ngAfterViewInit(): void {
    // check if the platform is broswer
    if (!this.platformService.isBrowser()) return;

    // Show the first slide
    this.activeSlides = [{ ...this.slides[0], visible: true }];

    this.slideSub = interval(this.intervalValue).subscribe(() => {
      const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;

      // Hide current
      this.activeSlides[0].visible = false;

      // Show next
      this.activeSlides.unshift({ ...this.slides[nextIndex], visible: true });

      // Remove old slide after fade-out
      setTimeout(() => {
        this.activeSlides.pop();
        this.currentSlideIndex = nextIndex;
      }, MinimiComponent.fadeOutDuration);
    });
  }

  ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
  }
}
