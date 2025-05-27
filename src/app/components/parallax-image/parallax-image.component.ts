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

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    this.scrollSubscription = this.eventService.scrollEvent$
    .pipe(throttleTime(16)) // Throttle to 60 FPS
    .subscribe(
      (e: ScrollEvent) => {
        this.animate(e);
      }
    );
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

  animate(scrollEvent: ScrollEvent): void {
    if (!this.platformService.isBrowser()) return;
    const wrapper = this.wrapperRef.nativeElement as HTMLElement;

    if(!this.platformService.isVisible(wrapper)) return;

    const direction = scrollEvent.scrollDirection() === 'up' ? -1 : 1;
    const distance =
      Math.abs(scrollEvent.scrollYOffset) * this.speedFactor() * direction;

    this.parallaxOffset += distance;

    const img = this.imageRef.nativeElement as HTMLElement;
    img.style.transform = `translateY(${this.parallaxOffset}px)`;
  }
}
