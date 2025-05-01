import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';
import { EventService, ScrollEvent } from '../../../../services/event.service';

@Component({
  selector: 'app-miracle',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit, OnDestroy {
  private scrollEventSubscription!: Subscription;

  @ViewChild('miracleImage', { static: true }) miracleImageRef!: ElementRef;
  @ViewChild('miracleSection', { static: true }) miracleSectionRef!: ElementRef;

  private parallaxOffset: number = 0;
  private parallaxSpeedFactor: number = 0.5;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => this.animateImage(e)
    );
  }

  ngOnDestroy(): void {
    this.scrollEventSubscription?.unsubscribe();
  }

  animateImage(scrollEvent: ScrollEvent): void {
    if (!this.platformService.isBrowser()) return;

    const section = this.miracleSectionRef.nativeElement as HTMLElement;

    if(!this.platformService.isVisible(section)) return;

    const rect = section.getBoundingClientRect();

    const scrollYOffset = scrollEvent.scrollYOffset; // Get the scroll offset from the event

    const currentParallaxOffset = this.parallaxOffset;
    /** 1 for down, -1 for up */
    let direction = scrollEvent.scrollDirection() === 'up' ? -1 : 1;
    const distance =
      Math.abs(scrollYOffset) * this.parallaxSpeedFactor * direction;
    this.parallaxOffset = currentParallaxOffset + distance;


    const imageContainer = this.miracleImageRef.nativeElement as HTMLElement;

    imageContainer.querySelector(
      'img'
    )!.style.transform = `translateY(${this.parallaxOffset}px)`;
  }
}
