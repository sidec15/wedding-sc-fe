
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../../../services/platform.service';
import { EventService } from '../../../../services/event.service';

@Component({
  selector: 'app-origins',
  imports: [TranslateModule],
  templateUrl: './origins.component.html',
  styleUrl: './origins.component.scss',
})
export class OriginsComponent implements AfterViewInit, OnDestroy {
  private scrollSubscription!: Subscription;

  churchHistoryImages = [
    { src: 'images/church/origins/origins-01.png', alt: 'History Image 1' },
    { src: 'images/church/origins/origins-02.png', alt: 'History Image 2' },
    { src: 'images/church/origins/origins-03.png', alt: 'History Image 3' },
    { src: 'images/church/origins/origins-04.png', alt: 'History Image 4' },
  ];

  @ViewChild('originsSection', { static: false }) originsSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('scrollTrack', { static: false }) scrollTrackRef!: ElementRef<HTMLElement>;
  
  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  // @ViewChild elements are not available in ngOnInit because the DOM is not fully rendered yet.
  // Angular's lifecycle order is as follows:
  // constructor() → Dependency Injection (DI) happens here, but no DOM interaction is possible.
  // ngOnInit() → Input bindings are resolved, but the DOM is still not fully rendered.
  // ngAfterViewInit() → The view is fully initialized, and @ViewChild elements are available for DOM manipulation.

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollSubscription = this.eventService.scrollEvent$.subscribe(scrollY => {
      this.resetCarouselIfNotVisible();
    });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

  
  private resetCarouselIfNotVisible(): void {
    if (!this.platformService.isBrowser()) return;
    const section = this.originsSectionRef?.nativeElement;
    const track = this.scrollTrackRef?.nativeElement;
  
    // ✅ Guard clause to prevent crash
    if (!(section instanceof HTMLElement) || !(track instanceof HTMLElement)) {
      return;
    }
  
    const rect = section.getBoundingClientRect();
    const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;
  
    if (!inViewport) {
      track.classList.remove('scroll-track');
      void track.offsetWidth; // force reflow
      track.classList.add('scroll-track');
    }
  }
  


}
