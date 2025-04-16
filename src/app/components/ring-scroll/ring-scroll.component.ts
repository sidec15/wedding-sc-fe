import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { VisibilityService } from '../../services/visibility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ring-scroll',
  imports: [NgStyle, NgClass],
  templateUrl: './ring-scroll.component.html',
  styleUrl: './ring-scroll.component.scss',
})
export class RingScrollComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  isEnabled: boolean = true;
  scrollPercent = 0;
  circumference = 2 * Math.PI * 26; // r = 26 (radius of the SVG circle)
  visibleIndexes = new Set<number>();

  @ViewChildren('storyBlock', { read: ElementRef }) storyBlockElements!: QueryList<ElementRef>;

  constructor(private visibilityService: VisibilityService) {}

  ngOnInit(): void {
    this.subscription = this.visibilityService.ringScrollEnabled$.subscribe(
      (enabled) => {
        this.isEnabled = enabled;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const windowHeight = window.innerHeight;

    this.storyBlockElements.forEach((el, index) => {
      const rect = el.nativeElement.getBoundingClientRect();
      const isCurrentlyVisible = rect.top < windowHeight * 0.75 && rect.bottom > 0;

      if (isCurrentlyVisible) {
        this.visibleIndexes.add(index);
      } else {
        this.visibleIndexes.delete(index); // Remove when not visible
      }
    });

    // Scroll percentage ring
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    ) - window.innerHeight;

    this.scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isVisible(): boolean {
    return this.isEnabled;
  }
}
