import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  HostListener,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-parallax-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './parallax-card.component.html',
  styleUrls: ['./parallax-card.component.scss'],
})
export class ParallaxCardComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  @Input() title = '';
  @Input() description = '';
  @Input() image = '';
  @Input() date?: { year: number; month?: number; day?: number };
  @Input() type: 'card' | 'intro' | 'outro' = 'card';
  @Input() textPosition: 'left' | 'right' = 'left';

  @ViewChild('card', { static: false }) cardEl?: ElementRef<HTMLElement>;
  @ViewChild('content', { static: false }) contentEl?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => this.updateParallax());
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateParallax();
  }

  updateParallax(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const isMobile = window.innerWidth <= 768;

    const card = this.cardEl?.nativeElement as HTMLElement;
    const content = this.contentEl?.nativeElement as HTMLElement;

    if (!card || typeof card.getBoundingClientRect !== 'function') return;

    const img = card.querySelector('img') as HTMLElement;

    const cardRect = card.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const scrollAmount = cardRect.top * 0.15;

    if (img && this.type === 'card') {
      // Mobile: stop animating when image bottom reaches content top
      const shouldAnimate = !isMobile || imgRect.bottom > contentRect.top;
      if (shouldAnimate) {
        img.style.transform = `translateY(${scrollAmount}px)`;
      }
    }

    const isVisible = cardRect.top < window.innerHeight * 0.8;
    if (isVisible && content) {
      content.classList.add('visible');
    } else {
      content.classList.remove('visible'); // Needed for fade-out
    }
  }

  formatDate(date: { year: number; month?: number; day?: number }): string {
    const parts: string[] = [];
    if (date.day) parts.push(date.day.toString().padStart(2, '0'));
    if (date.month) parts.push(date.month.toString().padStart(2, '0'));
    parts.push(date.year.toString());
    return parts.join('/');
  }
}
