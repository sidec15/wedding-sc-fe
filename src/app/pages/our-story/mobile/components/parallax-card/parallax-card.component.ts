import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../../services/platform.service';

@Component({
  selector: 'app-parallax-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './parallax-card.component.html',
  styleUrls: ['./parallax-card.component.scss'],
})
export class ParallaxCardComponent implements AfterViewInit {
  @Input() title = '';
  @Input() description = '';
  @Input() image = '';
  @Input() textPosition: 'left' | 'right' = 'left';
  @Input() comics?: string[];
  @Input() type: 'card' | 'intro' | 'outro' = 'card';

  @ViewChild('card', { static: false }) cardEl?: ElementRef<HTMLElement>;
  @ViewChild('content', { static: false }) contentEl?: ElementRef<HTMLElement>;

  constructor(private platformService: PlatformService) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;
    requestAnimationFrame(() => this.updateParallax());
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateParallax();
  }

  updateParallax(): void {
    if (!this.platformService.isBrowser()) return;
    const isMobile = window.innerWidth <= 768;

    const card = this.cardEl?.nativeElement as HTMLElement;
    const content = this.contentEl?.nativeElement as HTMLElement;

    if (!card || typeof card.getBoundingClientRect !== 'function') return;

    const img = card.querySelector('img') as HTMLElement;

    const cardRect = card.getBoundingClientRect();
    const imgRect = img?.getBoundingClientRect();
    const contentRect = content?.getBoundingClientRect();
    const scrollAmount = cardRect.top * 0.15;

    if (img && this.type === 'card') {
      const shouldAnimate =
        !isMobile || scrollAmount > 0 || imgRect.bottom > contentRect.top;
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
}
