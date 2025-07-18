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
  @Input() type: 'card' | 'intro' | 'outro' = 'card';
  @Input() textPosition: 'left' | 'right' = 'left';
  @Input() comic?: string;
  @Input() comicPositionX?: 'left' | 'right';
  @Input() comicPositionY?: 'top' | 'bottom';

  @ViewChild('card', { static: false }) cardEl?: ElementRef<HTMLElement>;
  @ViewChild('content', { static: false }) contentEl?: ElementRef<HTMLElement>;

  private isVisible = false;
  private animationTriggered = false;

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
    const textOverlay = card.querySelector('.text-overlay') as HTMLElement;
    const comicWrapper = card.querySelector('.comic-wrapper') as HTMLElement;

    const cardRect = card.getBoundingClientRect();
    const scrollAmount = cardRect.top * 0.1;

    // Apply subtle parallax effect to image
    if (img && this.type === 'card') {
      const shouldAnimate = !isMobile || scrollAmount > 0;
      if (shouldAnimate) {
        img.style.transform = `translateY(${scrollAmount}px)`;
      }
    }

    // Check if card is visible in viewport
    const viewportHeight = window.innerHeight;
    const triggerPoint = viewportHeight * 0.75; // Trigger when 75% of viewport is reached
    const isCurrentlyVisible = cardRect.top < triggerPoint && cardRect.bottom > 0;

    // Handle visibility animations
    if (isCurrentlyVisible && !this.animationTriggered) {
      this.animationTriggered = true;
      this.isVisible = true;

      // Add visible class to content (for intro/outro types)
      if (content) {
        content.classList.add('visible');
      }

      // Add visible class to text overlay with delay
      if (textOverlay) {
        setTimeout(() => {
          textOverlay.classList.add('visible');
        }, 100);
      }

      // Add visible class to comic wrapper with delay
      if (comicWrapper) {
        setTimeout(() => {
          comicWrapper.classList.add('visible');
        }, 600);
      }
    } else if (!isCurrentlyVisible && this.animationTriggered) {
      // Optional: Reset animations when scrolling away (for reusability)
      this.animationTriggered = false;
      this.isVisible = false;

      if (content) {
        content.classList.remove('visible');
      }

      if (textOverlay) {
        textOverlay.classList.remove('visible');
      }

      if (comicWrapper) {
        comicWrapper.classList.remove('visible');
      }
    }
  }

  // Method to trigger image gallery opening
  openGallery(): void {
    // This will be handled by the parent component
    // You can emit an event here if needed
  }
}
