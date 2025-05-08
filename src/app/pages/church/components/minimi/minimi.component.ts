import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { PlatformService } from '../../../../services/platform.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-minimi',
  imports: [TranslateModule],
  templateUrl: './minimi.component.html',
  styleUrl: './minimi.component.scss',
  animations: [
    trigger('fadeSlide', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', [animate('1s ease-out')]),
      transition('hidden => visible', [animate('1.5s ease-in')]),
    ]),
  ],
})
export class MinimiComponent implements AfterViewInit, OnDestroy {
  private slideSub!: Subscription;

  slides = [
    {
      imageUrl: '/images/church/origins/origins-01.png',
      text: 'The Sanctuary of San Francesco di Paola in Calabria, spiritual heart of the Order of Minims.',
    },
    {
      imageUrl: '/images/church/origins/origins-03.png',
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
  currentSlide = this.slides[0];
  fadeState: 'visible' | 'hidden' = 'visible';

  private intervalValue: number = 4000;

  constructor(private platformService: PlatformService) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;
    this.slideSub = interval(this.intervalValue).subscribe(() => {
      this.fadeState = 'hidden';

      setTimeout(() => {
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
        this.currentSlide = this.slides[this.currentSlideIndex];
        this.fadeState = 'visible';
      }, 0); // match the hide animation duration
    });
  }

  ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
  }
}
