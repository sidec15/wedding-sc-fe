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

    // Animate the description
    const descriptionEl = this.descriptionRef.nativeElement;
    const descriptionRect = descriptionEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Progress from 0 (bottom of screen) to 1 (center)
    const visibleRatio = 1 - Math.min(Math.max((descriptionRect.top - windowHeight * 0.3) / (windowHeight * 0.5), 0), 1);

    // Clamp + ease
    const opacity = visibleRatio;
    const translateY = (1 - visibleRatio) * 40;
    const scale = 0.975 + visibleRatio * 0.025;

    descriptionEl.style.opacity = `${opacity}`;
    descriptionEl.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;

    // Animate the left angel image
    const angelLeftEl = this.angelLeftRef.nativeElement;
    const angelLeftRect = angelLeftEl.getBoundingClientRect();
    const angelLeftVisibleRatio = 1 - Math.min(Math.max((angelLeftRect.top - windowHeight * 0.3) / (windowHeight * 0.5), 0), 1);

    const angelLeftScale = 1 + angelLeftVisibleRatio * 0.1; // Zoom in by 10%
    angelLeftEl.style.transform = `scale(${angelLeftScale})`;

    // Animate the right angel image
    const angelRightEl = this.angelRightRef.nativeElement;
    const angelRightRect = angelRightEl.getBoundingClientRect();
    const angelRightVisibleRatio = 1 - Math.min(Math.max((angelRightRect.top - windowHeight * 0.3) / (windowHeight * 0.5), 0), 1);

    const angelRightScale = 1 + angelRightVisibleRatio * 0.1; // Zoom in by 10%
    angelRightEl.style.transform = `scale(${angelRightScale})`;
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
