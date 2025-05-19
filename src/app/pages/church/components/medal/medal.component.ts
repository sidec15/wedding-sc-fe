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
import { Subscription } from 'rxjs';
import { HorizontalMovingBackgroundComponent } from '../../../../components/horizontal-moving-background/horizontal-moving-background.component';

@Component({
  selector: 'app-medal',
  imports: [TranslateModule, HorizontalMovingBackgroundComponent],
  templateUrl: './medal.component.html',
  styleUrl: './medal.component.scss',
})
export class MedalComponent implements AfterViewInit, OnDestroy {
  private scrollEventSubscription!: Subscription;

  @ViewChild('descriptionLeft', { static: false })
  descriptionLeftRef!: ElementRef<HTMLElement>;

  @ViewChild('descriptionRight', { static: false })
  descriptionRightRef!: ElementRef<HTMLElement>;

  @ViewChild('imageContainer', { static: false })
  imageContainerRef!: ElementRef<HTMLElement>;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        this.animate(e);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

  private animate(e: ScrollEvent) {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    const minScale = 0.2;
    const maxScale = 1.2; // Maximum scale for the angels

    // Animate the description
    const descriptionLeftEl = this.descriptionLeftRef.nativeElement;
    const descriptionRightEl = this.descriptionRightRef.nativeElement;
    const descriptionLeftRect = descriptionLeftEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Progress from 0 (bottom of screen) to 1 (center)
    const visibleRatio =
      1 -
      Math.min(
        Math.max(
          (descriptionLeftRect.top - windowHeight * 0.3) / (windowHeight * 0.8),
          0
        ),
        1
      );

    // Clamp + ease for description
    minScale + visibleRatio * (maxScale - minScale); // Scale from min to max scale
    const descriptionOpacity = visibleRatio;

    descriptionLeftEl.style.opacity = `${descriptionOpacity}`;
    descriptionRightEl.style.opacity = `${descriptionOpacity}`;

    // Animate the angel images based on the same visibility ratio
    const imageContainerEl = this.imageContainerRef.nativeElement;

    const scaleAmount = minScale + visibleRatio * (maxScale - minScale); // Scale from min to max scale
    imageContainerEl.style.transform = `scale(${scaleAmount})`;
  }
}
