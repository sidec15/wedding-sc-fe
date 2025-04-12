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
  styleUrls: ['./parallax-card.component.scss'],
})
export class ParallaxCardComponent implements AfterViewInit {
  @Input() title = '';
  @Input() description = '';
  @Input() image = '';
  @Input() date?: { year: number; month?: number; day?: number };
  @Input() type: 'card' | 'intro' | 'outro' = 'card';

  @ViewChild('card', { static: false }) cardEl!: ElementRef<HTMLElement>;
  @ViewChild('content', { static: false }) contentEl!: ElementRef<HTMLElement>;


  ngAfterViewInit(): void {
    this.updateParallax();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateParallax();
  }

  updateParallax() {
    if (!this.cardEl || !this.cardEl.nativeElement) return;
  
    const cardRect = this.cardEl.nativeElement.getBoundingClientRect();
    const content = this.contentEl?.nativeElement;
    const img = this.cardEl.nativeElement.querySelector('img');
  
    const scrollAmount = cardRect.top * 0.15;
    if (img && this.type === 'card') {
      img.style.transform = `translateY(${scrollAmount}px)`;
    }
  
    const isVisible = cardRect.top < window.innerHeight * 0.8;
    if (content) {
      content.classList.toggle('visible', isVisible);
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
