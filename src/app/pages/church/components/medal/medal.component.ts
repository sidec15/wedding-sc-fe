import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';
import { EventService, ScrollEvent } from '../../../../services/event.service';
import { Subscription, throttleTime } from 'rxjs';
import { HorizontalMovingBackgroundComponent } from '../../../../components/horizontal-moving-background/horizontal-moving-background.component';

@Component({
  selector: 'app-medal',
  imports: [TranslateModule, HorizontalMovingBackgroundComponent],
  templateUrl: './medal.component.html',
  styleUrl: './medal.component.scss',
})
export class MedalComponent implements AfterViewInit, OnDestroy {
  private scrollEventSubscription!: Subscription;

  @ViewChild('medalContainer', { static: false })
  medalContainerRef!: ElementRef<HTMLElement>;

  @ViewChild('descriptionLeft', { static: false })
  descriptionLeftRef!: ElementRef<HTMLElement>;

  @ViewChild('descriptionRight', { static: false })
  descriptionRightRef!: ElementRef<HTMLElement>;

  @ViewChild('imageContainer', { static: false })
  imageContainerRef!: ElementRef<HTMLElement>;

  private minScale = 0.2;
  private maxScale = 1.2;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    if (this.platformService.isMobile()) {
      // this.minScale = 0.6; // Adjust min scale for mobile
      this.maxScale = 1.0; // Adjust max scale for mobile
    }

    this.scrollEventSubscription = this.eventService.scrollEvent$
      .pipe(throttleTime(16)) // Throttle to ~60 FPS
      .subscribe((e: ScrollEvent) => {
        this.animate(e);
      });
  }

  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

  get isMobile(): boolean {
    return this.platformService.isMobile();
  }

  private animate(e: ScrollEvent) {
    const imageContainerEl = this.imageContainerRef.nativeElement;
    const descriptionLeftEl = this.descriptionLeftRef.nativeElement;
    const descriptionRightEl = this.descriptionRightRef.nativeElement;

    let domRect: DOMRect | null = null;
    if (this.isMobile) {
      domRect = imageContainerEl.getBoundingClientRect();
    } else {
      domRect = descriptionLeftEl.getBoundingClientRect();
    }

    const windowHeight = window.innerHeight;

    let visibleRatio =
      1 -
      Math.min(
        Math.max((domRect.top - windowHeight * 0.3) / (windowHeight * 0.8), 0),
        1
      );

    if (!this.isMobile) {
      const descriptionOpacity = visibleRatio;

      descriptionLeftEl.style.opacity = `${descriptionOpacity}`;
      descriptionRightEl.style.opacity = `${descriptionOpacity}`;
    } else {
      visibleRatio = Math.min(visibleRatio * 1.5, 1); // 1.5 is the speed factor — tweak as needed
    }

    const minScale = this.minScale;
    const maxScale = this.maxScale;
    const imageScale = minScale + visibleRatio * (maxScale - minScale); // Scale from min to max scale

    imageContainerEl.style.transform = `scale(${imageScale})`;
  }
}
