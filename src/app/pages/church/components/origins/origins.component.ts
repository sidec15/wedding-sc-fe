import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-origins',
  imports: [TranslateModule, NgFor],
  templateUrl: './origins.component.html',
  styleUrl: './origins.component.scss',
})
export class OriginsComponent {
  churchHistoryImages = [
    { src: 'images/church/origins/origins-01.png', alt: 'History Image 1' },
    { src: 'images/church/origins/origins-02.png', alt: 'History Image 2' },
    { src: 'images/church/origins/origins-03.png', alt: 'History Image 3' },
    { src: 'images/church/origins/origins-04.png', alt: 'History Image 4' },
  ];


}
