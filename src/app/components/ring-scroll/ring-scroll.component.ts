import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { Subscription, throttleTime } from 'rxjs';
import { EventService } from '../../services/event.service';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-ring-scroll',
  imports: [NgStyle, NgClass],
  templateUrl: './ring-scroll.component.html',
  styleUrl: './ring-scroll.component.scss',
})
export class RingScrollComponent implements AfterViewInit, OnDestroy {
  private ringSub!: Subscription;
  private scrollSub!: Subscription;

  isEnabled: boolean = true;
  scrollPercent = 0;
  circumference = 2 * Math.PI * 26; // r = 26 (radius of the SVG circle)
  visibleIndexes = new Set<number>();

  @ViewChildren('storyBlock', { read: ElementRef })
  storyBlockElements!: QueryList<ElementRef>;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    this.ringSub = this.eventService.ringScrollEnabled$.subscribe((enabled) => {
      this.isEnabled = enabled;
    });

    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16)) // Throttle to 60 FPS
      .subscribe((event) => {
        if (this.isEnabled) {
          this.onWindowScroll(); // Update scroll percentage on scroll event
        }
      });
  }

  ngOnDestroy(): void {
    this.ringSub?.unsubscribe();
    this.scrollSub?.unsubscribe();
  }

  onWindowScroll(): void {
    if (!this.platformService.isPlatformReady()) return;

    const windowHeight = window.innerHeight;

    this.storyBlockElements.forEach((el, index) => {
      const rect = el.nativeElement.getBoundingClientRect();
      const isCurrentlyVisible =
        rect.top < windowHeight * 0.75 && rect.bottom > 0;

      if (isCurrentlyVisible) {
        this.visibleIndexes.add(index);
      } else {
        this.visibleIndexes.delete(index); // Remove when not visible
      }
    });

    // Scroll percentage ring
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      ) - window.innerHeight;

    this.scrollPercent = Math.min(
      100,
      Math.round((scrollTop / docHeight) * 100)
    );
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0 });
  }

  isVisible(): boolean {
    return this.isEnabled;
  }
}
