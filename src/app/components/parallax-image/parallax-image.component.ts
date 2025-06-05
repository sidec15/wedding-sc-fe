import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subscription, throttleTime } from 'rxjs';
import { EventService, ScrollEvent } from '../../services/event.service';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-parallax-image',
  standalone: true,
  imports: [],
  templateUrl: './parallax-image.component.html',
  styleUrl: './parallax-image.component.scss',
})
export class ParallaxImageComponent implements AfterViewInit, OnDestroy {
  src = input.required<string>();
  alt = input<string>('');
  containerHeight = input('500px');
  imageHeight = input('650px');
  speedFactor = input(0.1);

  @ViewChild('image', { static: true }) imageRef!: ElementRef;
  @ViewChild('wrapper', { static: true }) wrapperRef!: ElementRef;

  private parallaxOffset = 0;
  private scrollSubscription!: Subscription;
  private positionYInViewPort!: string;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    this.scrollSubscription = this.eventService.scrollEvent$
      .pipe(throttleTime(16)) // Throttle to 60 FPS
      .subscribe((e: ScrollEvent) => {
        this.checkVisibility(e);
        this.animate();
      });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

animate(): void {
  if (!this.platformService.isPlatformReady()) return;
  if (this.positionYInViewPort !== 'visible') return;

  const wrapper = this.wrapperRef.nativeElement as HTMLElement;
  const img = this.imageRef.nativeElement as HTMLElement;

  const rect = wrapper.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Parallax base: how far from center of viewport
  const distanceFromCenter = rect.top + rect.height / 2 - windowHeight / 2;

  // This value should be smaller than 1 (e.g. 0.2) to slow down image movement
  const translateY = distanceFromCenter * this.speedFactor();

  img.style.transform = `translateY(${translateY}px)`;
}


  checkVisibility(e: ScrollEvent) {
    const wrapper = this.wrapperRef.nativeElement as HTMLElement;
    this.positionYInViewPort =
      this.platformService.positionYInViewport(wrapper);
    if (
      this.positionYInViewPort === 'below' ||
      this.positionYInViewPort === 'above'
    ) {
      // Reset parallax offset when the element is out of view
      this.parallaxOffset = 0;
      const img = this.imageRef.nativeElement as HTMLElement;
      img.style.transform = `translateY(0px)`;
    }
  }
}
