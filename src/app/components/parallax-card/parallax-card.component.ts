import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  HostListener,
  ViewChild,
  Inject,
  PLATFORM_ID
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
  
    const card = this.cardEl?.nativeElement as HTMLElement;
    const content = this.contentEl?.nativeElement as HTMLElement;
  
    if (!card || typeof card.getBoundingClientRect !== 'function') return;
  
    const rect = card.getBoundingClientRect();
    const scrollAmount = rect.top * 0.15;
  
    const img = card.querySelector('img');
    if (img && this.type === 'card') {
      img.style.transform = `translateY(${scrollAmount}px)`;
    }
  
    const isVisible = rect.top < window.innerHeight * 0.8;
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
