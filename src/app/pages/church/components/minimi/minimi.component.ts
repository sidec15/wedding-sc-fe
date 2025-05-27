import { Component } from '@angular/core';
import { CarouselComponent, Slide } from '../../../../components/carousel/carousel.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-minimi',
  imports: [TranslateModule, CarouselComponent],
  templateUrl: './minimi.component.html',
  styleUrl: './minimi.component.scss',
})
export class MinimiComponent {

  /** Duration for fade-out animation in milliseconds */
  private static readonly DURATION = 6000;

  slides: Slide[] = [
    {
      imageUrl: '/images/church/minimi/minimi-01.png',
      title: 'church.minimi.slides.0.title',
      description: 'church.minimi.slides.0.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/minimi-02.png',
      title: 'church.minimi.slides.1.title',
      description: 'church.minimi.slides.1.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/minimi-03.png',
      title: 'church.minimi.slides.2.title',
      description: 'church.minimi.slides.2.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/minimi-04.png',
      title: 'church.minimi.slides.3.title',
      description: 'church.minimi.slides.3.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/minimi-05.png',
      title: 'church.minimi.slides.4.title',
      description: 'church.minimi.slides.4.description',
      duration: MinimiComponent.DURATION,
    },
  ];

  slidesMobile: Slide[] = [
    {
      imageUrl: '/images/church/minimi/mobile/minimi-01.png',
      title: 'church.minimi.slides.0.title',
      description: 'church.minimi.slides.0.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/mobile/minimi-02.png',
      title: 'church.minimi.slides.1.title',
      description: 'church.minimi.slides.1.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/mobile/minimi-03.png',
      title: 'church.minimi.slides.2.title',
      description: 'church.minimi.slides.2.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/mobile/minimi-04.png',
      title: 'church.minimi.slides.3.title',
      description: 'church.minimi.slides.3.description',
      duration: MinimiComponent.DURATION,
    },
    {
      imageUrl: '/images/church/minimi/mobile/minimi-05.png',
      title: 'church.minimi.slides.4.title',
      description: 'church.minimi.slides.4.description',
      duration: MinimiComponent.DURATION,
    },
  ];

  constructor() {}
}
