import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../../services/event.service';
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

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (scrollY: number) => {
        this.animateDescription(scrollY);
        this.checkVisibility(this.angelLeftRef.nativeElement);
        this.checkVisibility(this.angelRightRef.nativeElement);
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
    const visibleRatio = 1 - Math.min(Math.max((descriptionRect.top - windowHeight * 0.3) / (windowHeight * 0.8), 0), 1);

    // Clamp + ease for description
    const descriptionScale = minScale + visibleRatio * (maxScaleDescription - minScale); // Scale from min to max scale
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
}
