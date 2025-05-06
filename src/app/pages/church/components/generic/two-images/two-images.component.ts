import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MovingBackgroundComponent } from '../../../../../components/moving-background/moving-background.component';
import { Subscription } from 'rxjs';
import {
  EventService,
  ScrollEvent,
} from '../../../../../services/event.service';
import { PlatformService } from '../../../../../services/platform.service';
import { NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-two-images',
  imports: [TranslateModule, MovingBackgroundComponent, NgFor, NgStyle],
  templateUrl: './two-images.component.html',
  styleUrl: './two-images.component.scss',
})
export class TwoImagesComponent implements AfterViewInit, OnDestroy {
  private scrollEventSubscription!: Subscription;

  movingBackgroundText = input.required<string>();
  contentTitle = input.required<string>();
  contentDescriptions = input.required<string[]>();
  imageUrlLeft = input.required<string>();
  imageUrlRight = input.required<string>();

  @ViewChild('description', { static: false })
  descriptionRef!: ElementRef<HTMLElement>;

  @ViewChild('imageLeft', { static: false })
  imageLeftRef!: ElementRef<HTMLElement>;

  @ViewChild('imageRight', { static: false })
  imageRightRef!: ElementRef<HTMLElement>;

  @ViewChild('descriptionContainer', { static: false })
  descriptionContainerRef!: ElementRef<HTMLElement>;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        // Update the parallax effect for the title background
        const scrollY = e.scrollY;
        this.animateDescription(scrollY);
      }
    );
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
    const imageLeftEl = this.imageLeftRef.nativeElement;
    const imageRightEl = this.imageRightRef.nativeElement;

    const angelScale = minScale + visibleRatio * (maxScaleAngels - minScale); // Scale from min to max scale
    imageLeftEl.style.transform = `scale(${angelScale})`;
    imageRightEl.style.transform = `scale(${angelScale})`;
  }
}
