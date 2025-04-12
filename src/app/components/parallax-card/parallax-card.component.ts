import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  HostListener,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parallax-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parallax-card.component.html',
  styleUrls: ['./parallax-card.component.scss']
})
export class ParallaxCardComponent implements AfterViewInit {
  @Input() title = '';
  @Input() description = '';
  @Input() image = '';
  @Input() date?: { year: number; month?: number; day?: number };
  @Input() type: 'card' | 'intro' | 'outro' = 'card';

  @ViewChild('card', { static: true }) cardEl!: ElementRef;
  @ViewChild('content', { static: true }) contentEl!: ElementRef;

  ngAfterViewInit(): void {
    this.updateParallax();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateParallax();
  }

  updateParallax() {
    const cardRect = this.cardEl.nativeElement.getBoundingClientRect();
    const content = this.contentEl.nativeElement;
    const img = this.cardEl.nativeElement.querySelector('img');

    // Animate image parallax
    const scrollAmount = cardRect.top * 0.15;
    if (img) {
      img.style.transform = `translateY(${scrollAmount}px)`;
    }

    // Animate text content visibility
    const isVisible = cardRect.top < window.innerHeight * 0.8;
    if (isVisible) {
      content.classList.add('visible');
    } else {
      content.classList.remove('visible');
    }

    console.log('top:', cardRect.top, 'visible?', isVisible);

  }
}
