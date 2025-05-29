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
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { PlatformService } from '../../../../services/platform.service';
import { NgIf } from '@angular/common';
import { EventService } from '../../../../services/event.service';
import { Subscription, take, throttleTime } from 'rxjs';
import {
  GenericCarouselComponent,
  Slide,
} from '../../../../components/generic-carousel/generic-carousel.component';

@Component({
  selector: 'app-miracle',
  imports: [
    TranslateModule,
    ParallaxImageComponent,
    NgIf,
    GenericCarouselComponent,
  ],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit, OnDestroy {
  /** Duration (in ms) each slide remains visible */
  private static readonly DURATION = 15000;

  /** Indicates if the platform is ready (browser rendering available) */
  isPlatformReady = false;

  /** Image shown as static background (desktop or mobile) */
  imageSrc: string = '';

  /** Platform mobile flag */
  private _isMobile = false;

  /** Subscription to the scroll animation stream */
  private scrollSub!: Subscription;

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
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;
    this.isPlatformReady = true;

    // Detect if the platform is mobile
    this._isMobile = this.platformService.isMobile();

    if (!this._isMobile) {
      // Desktop: use static image
      this.imageSrc = '/images/church/miracle/miracle-01.jpg';
    } else {
      // Mobile: use mobile-optimized image
      this.imageSrc = '/images/church/miracle/miracle-09.jpg';

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

    /**
     * This second detectChanges prevents ExpressionChangedAfterItHasBeenCheckedError.
     * It reconciles any bindings that were affected during `ngAfterViewInit`.
     */
    this.cdRef.detectChanges();

    if (!this._isMobile) return;

    /**
     * Subscribe to scroll events (throttled for performance).
     * Used to animate the parallax text block based on scroll progress.
     */
    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16)) // ~60 FPS
      .subscribe(() => this.animateText());
  }

  ngOnDestroy(): void {
    // Prevent memory leaks by unsubscribing
    this.scrollSub?.unsubscribe();
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
  get isMobile(): boolean {
    return this._isMobile;
  }
}
