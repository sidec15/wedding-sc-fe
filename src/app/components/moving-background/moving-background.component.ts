import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../services/platform.service';
import { EventService, ScrollEvent } from '../../services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-moving-background',
  imports: [TranslateModule],
  templateUrl: './moving-background.component.html',
  styleUrl: './moving-background.component.scss',
})
export class MovingBackgroundComponent implements AfterViewInit, OnDestroy {

  @Input()
  content: string = '';

  private scrollEventSubscription!: Subscription;

  @ViewChild('movingBackground', { static: false })
  movingBackgroundRef!: ElementRef<HTMLElement>;

  private parallaxOffset: number = 0;
  private speedFactor: number = 0.1;
  private isVisible: boolean = false;
  private notVisibleReason: 'scroll-top' | 'scroll-bottom' = 'scroll-top';

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        this.updateTitleParallax(e);
      }
    );

    const initialScrollY = window.scrollY || document.documentElement.scrollTop;
    this.updateTitleParallax(new ScrollEvent(initialScrollY, 0));
  }

  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

  private updateTitleParallax(scrollEvent: ScrollEvent): void {
    const movingBgEl = this.movingBackgroundRef?.nativeElement;
    // now get the container element of movingBgEl
    const containerEl = movingBgEl?.parentElement || null;


    if (!movingBgEl || !containerEl) return;

    // Check if container is visible in viewport
    if (!this.isElementInViewport(containerEl)) {
      // if it was previously visible, set the not visible reason to scroll-top or scroll-bottom
      if (this.isVisible) {
        // set the not visible reason according to the scroll direction
        if (scrollEvent.scrollDirection() === 'up') {
          this.notVisibleReason = 'scroll-top'; // Set the reason for not visible
        } else {
          this.notVisibleReason = 'scroll-bottom'; // Set the reason for not visible
        }
        if (this.notVisibleReason === 'scroll-top') {
          // reset the parallax background element to its initial status
          this.parallaxOffset = 0; // Reset the parallax offset
          movingBgEl.style.transform = `translate(-50%, -50%) translateY(0px)`; // Reset the transform
          movingBgEl.style.opacity = '0'; // Reset the opacity
        }

        this.isVisible = false; // Set the visibility to false if the container is not in viewport
      }

      return;
    }

    this.isVisible = true; // Set the visibility to true if the container is in viewport

    const scrollYOffset = scrollEvent.scrollYOffset; // Get the scroll offset from the event

    const currentParallaxOffset = this.parallaxOffset;
    /** 1 for down, -1 for up */
    let direction = scrollYOffset > 0 ? 1 : -1;
    const distance = Math.abs(scrollYOffset) * this.speedFactor * direction;
    this.parallaxOffset = currentParallaxOffset + distance;

    // Update movement
    movingBgEl.style.transform = `translate(-50%, -50%) translateY(${this.parallaxOffset}px)`;

    // Update opacity: from 0 to 1 as scroll increases
    const maxScrollForFullOpacity = 300; // You can adjust this value for how "fast" it fades in
    const opacity = Math.min(
      Math.max(this.parallaxOffset / maxScrollForFullOpacity, 0),
      1
    );

    movingBgEl.style.opacity = opacity.toString();
  }

  private isElementInViewport(el: HTMLElement): boolean {
    if (!this.platformService.isBrowser()) return false; // Ensure this runs only in the browser
    const rect = el.getBoundingClientRect();
    return (
      rect.top < window.innerHeight && // Element's top is above bottom of viewport
      rect.bottom > 0 // Element's bottom is below top of viewport
    );
  }
}
