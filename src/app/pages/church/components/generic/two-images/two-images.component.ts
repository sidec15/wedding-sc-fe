import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MovingBackgroundComponent } from '../../../../../components/moving-background/moving-background.component';
import { Observable, Subject, Subscription, EMPTY } from 'rxjs';
import {
  EventService,
  ScrollEvent,
} from '../../../../../services/event.service';
import { PlatformService } from '../../../../../services/platform.service';

import {
  CarouselComponent,
  Slide,
} from '../../../../../components/carousel/carousel.component';
import { AsyncPipe } from '@angular/common';

import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-two-images',
  imports: [
    TranslateModule,
    MovingBackgroundComponent,
    CarouselComponent,
    AsyncPipe
],
  templateUrl: './two-images.component.html',
  styleUrl: './two-images.component.scss',
})
export class TwoImagesComponent implements OnInit, AfterViewInit, OnDestroy {
  // private scrollEventSubscription!: Subscription;
  private destroy$ = new Subject<void>();

  movingBackgroundText = input.required<string>();
  contentTitle = input.required<string>();
  contentDescriptions = input.required<string[]>();
  imageUrlLeft = input.required<string>();
  imageUrlRight = input.required<string>();

  slidesMobile: Slide[] = [];

  @ViewChild('description', { static: false })
  descriptionRef!: ElementRef<HTMLElement>;

  @ViewChild('imageLeft', { static: false })
  imageLeftRef!: ElementRef<HTMLElement>;

  @ViewChild('imageRight', { static: false })
  imageRightRef!: ElementRef<HTMLElement>;

  @ViewChild('descriptionContainer', { static: false })
  descriptionContainerRef!: ElementRef<HTMLElement>;

  isMobile$: Observable<boolean>;

  private readonly slideDuration = 20000; // Duration for each slide in milliseconds

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {
    this.isMobile$ = this.eventService.isMobile$;
  }

  ngOnInit(): void {
    this.slidesMobile = [
      {
        imageUrl: this.imageUrlLeft(),
        title: '',
        description: this.contentDescriptions()[0] ?? '',
        duration: this.slideDuration,
      },
      {
        imageUrl: this.imageUrlRight(),
        title: '',
        description: this.contentDescriptions()[1] ?? '',
        duration: this.slideDuration,
      },
    ];
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    /**
     * Manages the subscription to scroll events based on the device's mobile status.
     * This reactive approach uses `isMobile$` to dynamically control whether the component
     * listens for scroll events. When `isMobile$` emits `false` (indicating a desktop environment),
     * it subscribes to `eventService.scrollEvent$` to enable desktop-specific animations.
     * Conversely, when `isMobile$` emits `true` (indicating a mobile environment),
     * it unsubscribes from `eventService.scrollEvent$` by returning `EMPTY`,
     * thereby preventing unnecessary event processing and optimizing performance on mobile devices.
     * The `takeUntil(this.destroy$)` operator ensures that all subscriptions are automatically
     * cleaned up when the component is destroyed, preventing memory leaks.
     */
    this.isMobile$.pipe(
      takeUntil(this.destroy$),
      switchMap(isMobile => {
        /*
         * This switchMap operator ensures that the scrollEvent$ subscription is managed dynamically.
         * If the device is not mobile (`!isMobile`), it subscribes to `eventService.scrollEvent$`,
         * enabling desktop-specific scroll animations. If the device is mobile (`isMobile`),
         * it returns `EMPTY`, effectively unsubscribing from `scrollEvent$` and preventing
         * unnecessary scroll event processing on mobile, optimizing performance and resource usage.
         * `takeUntil(this.destroy$)` ensures all subscriptions are cleaned up when the component is destroyed.
         */
        if (!isMobile) {
          // If not mobile (desktop), subscribe to scroll events
          return this.eventService.scrollEvent$;
        } else {
          // If mobile, stop listening to scroll events (return an empty observable)
          return EMPTY;
        }
      })
    ).subscribe((e: ScrollEvent) => {
      // This block will only execute if it's not mobile and a scroll event occurs
      const scrollY = e.scrollY;
      this.animateDesktop(scrollY);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to signal completion
    this.destroy$.complete(); // Complete the subject
  }

  private animateDesktop(scrollY: number) {
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
    const imageLeftEl = this.imageLeftRef.nativeElement;
    const imageRightEl = this.imageRightRef.nativeElement;

    const angelScale = minScale + visibleRatio * (maxScaleAngels - minScale); // Scale from min to max scale
    imageLeftEl.style.transform = `scale(${angelScale})`;
    imageRightEl.style.transform = `scale(${angelScale})`;
  }
}
