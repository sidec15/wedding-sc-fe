import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reception-intro',
  imports: [TranslateModule, NgStyle],
  templateUrl: './reception-intro.component.html',
  styleUrl: './reception-intro.component.scss',
})
export class ReceptionIntroComponent {
  @Input() images: string[] = [
    '/images/reception/intro/intro-01.png',
  ];
  currentImageIndex = 0;

  get imageUrl(): string {
    return `url(${this.images[this.currentImageIndex]})`;
  }

  // Optional: automatic switch
  ngOnInit(): void {
    // setInterval(() => {
    //   this.currentImageIndex =
    //     (this.currentImageIndex + 1) % this.images.length;
    // }, 8000);
  }
}
