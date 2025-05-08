import { NgStyle } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-minimi',
  imports: [TranslateModule],
  templateUrl: './minimi.component.html',
  styleUrl: './minimi.component.scss'
})
export class MinimiComponent implements AfterViewInit, OnDestroy {

  slides = [
    {
      imageUrl: '/images/church/origins/origins-01.png',
      text: 'The Sanctuary of San Francesco di Paola in Calabria, spiritual heart of the Order of Minims.'
    },
    {
      imageUrl: '/images/church/origins/origins-03.png',
      text: 'The Order of Minims lives in humility, penance, and charity, following the path of their founder.'
    },
    {
      imageUrl: '/images/church/origins/origins-03.png',
      text: 'San Francesco di Paola, a man of miracles and peace, called all to a life of simplicity and love.'
    },
    {
      imageUrl: '/images/church/origins/origins-04.png',
      text: 'In silence and contemplation, the Frati Minimi dedicate their lives to prayer and service.'
    }
  ];
  
  currentSlideIndex = 0;
  currentSlide = this.slides[0];

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

}
