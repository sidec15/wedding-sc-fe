import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, ScrollEvent } from '../../../../services/event.service';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-angels',
  imports: [TranslateModule],
  templateUrl: './angels.component.html',
  styleUrl: './angels.component.scss',
})
export class AngelsComponent implements AfterViewInit, OnDestroy {
  private scrollEventSubscription!: Subscription;

  @ViewChild('description', { static: false })
  descriptionRef!: ElementRef<HTMLElement>;

  @ViewChild('angelLeft', { static: false })
  angelLeftRef!: ElementRef<HTMLElement>;

  @ViewChild('angelRight', { static: false })
  angelRightRef!: ElementRef<HTMLElement>;

  @ViewChild('angelsTitleBackground', { static: false })
  angelsTitleBackgroundRef!: ElementRef<HTMLElement>;

  @ViewChild('descriptionContainer', { static: false })
  descriptionContainerRef!: ElementRef<HTMLElement>;

  private parallaxOffset: number = 0;
  private speedFactor: number = 0.1;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        // Update the parallax effect for the title background
        const scrollY = e.scrollY;
        this.updateTitleParallax(e);
        this.animateDescription(scrollY);
        this.checkVisibility(this.angelLeftRef.nativeElement);
        this.checkVisibility(this.angelRightRef.nativeElement);
      }
    );

    // Immediately trigger the first update after view initialized
    const initialScrollY = window.scrollY || 0;
    this.updateTitleParallax({ scrollYOffset: initialScrollY } as ScrollEvent);
  }

  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

  private animateDescription(scrollY: number) {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    const minScale = 0.7; // Minimum scale for the description and angels
    const maxScaleDescription = 1.1; // Maximum scale for the description
    const maxScaleAngels = 1.2; // Maximum scale for the angels

    // Animate the description
    const descriptionEl = this.descriptionRef.nativeElement;
    const descriptionRect = descriptionEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Progress from 0 (bottom of screen) to 1 (center)
    const visibleRatio =
      1 -
      Math.min(
        Math.max(
          (descriptionRect.top - windowHeight * 0.3) / (windowHeight * 0.8),
          0
        ),
        1
      );

    // Clamp + ease for description
    const descriptionScale =
      minScale + visibleRatio * (maxScaleDescription - minScale); // Scale from min to max scale
    const descriptionOpacity = visibleRatio;
    const descriptionTranslateY = (1 - visibleRatio) * 40;

    descriptionEl.style.opacity = `${descriptionOpacity}`;
    descriptionEl.style.transform = `translate3d(0, ${descriptionTranslateY}px, 0) scale(${descriptionScale})`;

    // Animate the angel images based on the same visibility ratio
    const angelLeftEl = this.angelLeftRef.nativeElement;
    const angelRightEl = this.angelRightRef.nativeElement;

    const angelScale = minScale + visibleRatio * (maxScaleAngels - minScale); // Scale from min to max scale
    angelLeftEl.style.transform = `scale(${angelScale})`;
    angelRightEl.style.transform = `scale(${angelScale})`;
  }

  private checkVisibility(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if the element is in the viewport
    const isVisible = rect.top < windowHeight && rect.bottom > 0;

    if (isVisible) {
      element.classList.add('visible'); // Add the zoom-in effect
    } else {
      element.classList.remove('visible'); // Remove the effect when out of view
    }
  }

  private updateTitleParallax(scrollEvent: ScrollEvent): void {
    const titleBgEl = this.angelsTitleBackgroundRef?.nativeElement;
    const containerEl = this.descriptionContainerRef?.nativeElement;

    if (!titleBgEl || !containerEl) return;

    const scrollYOffset = scrollEvent.scrollYOffset; // Get the scroll offset from the event

    // Check if container is visible in viewport
    if (!this.isElementInViewport(containerEl)) {
      return;
    }

    const currentParallaxOffset = this.parallaxOffset;
    /** 1 for down, -1 for up */
    let direction = scrollYOffset > 0 ? 1 : -1;
    const distance = Math.abs(scrollYOffset) * this.speedFactor * direction;
    this.parallaxOffset = currentParallaxOffset + distance;

    // Update movement
    titleBgEl.style.transform = `translate(-50%, -50%) translateY(${this.parallaxOffset}px)`;

    // Update opacity: from 0 to 1 as scroll increases
    const maxScrollForFullOpacity = 300; // You can adjust this value for how "fast" it fades in
    const opacity = Math.min(
      Math.max(this.parallaxOffset / maxScrollForFullOpacity, 0),
      1
    );

    titleBgEl.style.opacity = opacity.toString();
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
