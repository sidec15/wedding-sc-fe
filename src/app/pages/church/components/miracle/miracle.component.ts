import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { PlatformService } from '../../../../services/platform.service';
import { EventService } from '../../../../services/event.service';
import { combineLatest, map, Observable, Subject, Subscription, take, takeUntil, throttleTime } from 'rxjs';
import {
  GenericCarouselComponent,
  Slide,
} from '../../../../components/generic-carousel/generic-carousel.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-miracle',
  imports: [
    TranslateModule,
    ParallaxImageComponent,
    GenericCarouselComponent,
    AsyncPipe,
  ],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
  standalone: true,
})
export class MiracleComponent implements AfterViewInit, OnDestroy, OnInit {
  /** Duration (in ms) each slide remains visible */
  private static readonly DURATION = 25000;
  private static readonly IMAGE_DESKTOP = '/images/church/miracle/miracle-11.jpg';
  private static readonly IMAGE_MOBILE = '/images/church/miracle/miracle-09.jpg';

  /** Indicates if the platform is ready (browser rendering available) */
  isPlatformReady = false;

  /** Image shown as static background (desktop or mobile) */
  imageSrc$: Observable<string>;

  /** Platform mobile flag */
  isMobile$: Observable<boolean>;

  /** Subscription to the scroll animation stream */
  private scrollSub!: Subscription;
  private destroy$ = new Subject<void>();

  /** Section and text DOM references for parallax effect */
  @ViewChild('miracleSection', { static: false }) sectionRef!: ElementRef;
  @ViewChild('miracleText', { static: false }) textRef!: ElementRef;

  /** References to the individual slide templates defined in the HTML */
  @ViewChildren('miracleSlide', { read: TemplateRef })
  slideTemplates!: QueryList<TemplateRef<any>>;

  /** Slides that will be passed to the generic carousel */
  slides: Slide[] = [];

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private cdRef: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.isMobile$ = this.eventService.isMobile$;
    this.imageSrc$ = this.isMobile$.pipe(
      map((isMobile) =>
        isMobile
          ? MiracleComponent.IMAGE_MOBILE
          : MiracleComponent.IMAGE_DESKTOP
      ),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    if (!this.platformService.isPlatformReady()) return;
    this.isPlatformReady = true;

    this.isMobile$.pipe(takeUntil(this.destroy$)).subscribe((isMobile) => {
      if (isMobile) {
        /**
         * TemplateRefs in @ViewChildren inside *ngIf are only available *after* view stabilization.
         * `NgZone.onStable` ensures the DOM is fully initialized before reading the templates.
         */
        this.zone.onStable.pipe(take(1)).subscribe(() => {
          this.slides = this.slideTemplates.map((template) => ({
            elementRef: template,
            duration: MiracleComponent.DURATION,
          }));
          if (this.slides.length > 0) {
            this.slides[0].visible = true; // Ensure first slide is visible
          }

          // Forces re-evaluation to update the input-bound carousel
          this.cdRef.detectChanges();
        });
      }
    });
  }

  ngAfterViewInit(): void {
    // if (!this.platformService.isPlatformReady()) return;
    // this.isPlatformReady = true;

    // // Detect if the platform is mobile
    // this._isMobile = this.platformService.isMobile();

    // if (!this._isMobile) {
    //   // Desktop: use static image
    //   this.imageSrc = MiracleComponent.IMAGE_DESKTOP;
    // } else {
    //   // Mobile: use mobile-optimized image
    //   this.imageSrc = MiracleComponent.IMAGE_MOBILE;

    //   /**
    //    * TemplateRefs in @ViewChildren inside *ngIf are only available *after* view stabilization.
    //    * `NgZone.onStable` ensures the DOM is fully initialized before reading the templates.
    //    */
    //   this.zone.onStable.pipe(take(1)).subscribe(() => {
    //     this.slides = this.slideTemplates.map((template) => ({
    //       elementRef: template,
    //       duration: MiracleComponent.DURATION,
    //     }));
    //     if (this.slides.length > 0) {
    //       this.slides[0].visible = true; // Ensure first slide is visible
    //     }

    //     // Forces re-evaluation to update the input-bound carousel
    //     this.cdRef.detectChanges();
    //   });
    // }

    /**
     * This second detectChanges prevents ExpressionChangedAfterItHasBeenCheckedError.
     * It reconciles any bindings that were affected during `ngAfterViewInit`.
     */
    this.cdRef.detectChanges();

    this.isMobile$.pipe(takeUntil(this.destroy$)).subscribe((isMobile) => {
      if (!isMobile) return; // Only subscribe to scroll on mobile

      /**
       * Subscribe to scroll events (throttled for performance).
       * Used to animate the parallax text block based on scroll progress.
       */
      this.scrollSub = this.eventService.scrollEvent$
        .pipe(throttleTime(16), takeUntil(this.destroy$)) // ~60 FPS
        .subscribe(() => this.animateText());
    });
  }

  ngOnDestroy(): void {
    // Prevent memory leaks by unsubscribing
    // this.scrollSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Animates the text overlay in sync with scroll position.
   * - Translates Y position from 100px to 0
   * - Scales from 0.8 to 1
   * - Fades in from opacity 0 to 1
   */
  animateText(): void {
    const section = this.sectionRef.nativeElement as HTMLElement;
    const text = this.textRef.nativeElement as HTMLElement;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Normalize position as a progress value [0, 1]
    const progress = Math.min(Math.max(1 - rect.top / windowHeight, 0), 1);

    const translateY = 100 * (1 - progress);
    const opacity = progress;
    const scale = 0.8 + 0.2 * progress;

    // Apply the styles directly to the DOM element
    text.style.transform = `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`;
    text.style.opacity = `${opacity}`;
  }

  /** Returns whether the current platform is a mobile device */
  // get isMobile(): boolean {
  //   return this._isMobile;
  // }
}
