import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  Input,
  InputSignal,
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

  content: InputSignal<string> = input.required<string>();
  maxOpacity: InputSignal<number> = input(0.5);
  /**
   * The maximum scroll distance for the background to be fully opaque.
   * This is used to calculate the opacity of the background based on the scroll position.
   * The opacity will be 0 when the scroll position is 0, and will increase to 1 as the scroll position reaches this value.
   * You can adjust this value to control how "fast" the background fades in.
   * For example, if you set this value to 100, the background will be fully opaque when the scroll position is 100.
   */
  maxScrollForFullOpacity: InputSignal<number> = input(200);
  speedFactor: InputSignal<number> = input(0.05);

  private scrollEventSubscription!: Subscription;

  @ViewChild('movingBackground', { static: false })
  movingBackgroundRef!: ElementRef<HTMLElement>;

  private parallaxOffset: number = 0;
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

    // const initialScrollY = window.scrollY || document.documentElement.scrollTop;
    // this.updateTitleParallax(new ScrollEvent(initialScrollY, 0));
  }

  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

  private updateTitleParallax(scrollEvent: ScrollEvent): void {

    const movingBgEl = this.movingBackgroundRef?.nativeElement;
    // get the first parent element that is not app-moving-background
    const containerEl = this.getContainerElement();

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
    let direction = scrollEvent.scrollDirection() === 'up' ? -1 : 1;
    const distance = Math.abs(scrollYOffset) * this.speedFactor() * direction;
    this.parallaxOffset = currentParallaxOffset + distance;

    // Update movement
    movingBgEl.style.transform = `translate(-50%, -50%) translateY(${this.parallaxOffset}px)`;

    // Update opacity: from 0 to 1 as scroll increases
    const opacity = Math.min(
      Math.max(this.parallaxOffset / this.maxScrollForFullOpacity(), 0),
      Math.min(this.maxOpacity(), 1)
    );

    movingBgEl.style.opacity = opacity.toString();
  }

  private isElementInViewport(el: HTMLElement): boolean {
    if (!this.platformService.isBrowser()) return false; // Ensure this runs only in the browser
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= window.innerHeight &&
      rect.bottom >= 0
    );
  }

  private getContainerElement(): HTMLElement | null {
    const movingBgEl = this.movingBackgroundRef?.nativeElement as HTMLElement | null;
  
    let parent = movingBgEl;
  
    while (parent && parent.tagName === 'APP-MOVING-BACKGROUND') {
      parent = parent.parentElement;
    }
  
    return parent;
  }
  
  
}
