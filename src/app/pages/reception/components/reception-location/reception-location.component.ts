
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription, throttleTime } from 'rxjs';
import { PlatformService } from '../../../../services/platform.service';
import { EventService, ScrollEvent } from '../../../../services/event.service';

@Component({
  selector: 'app-reception-location',
  imports: [TranslateModule],
  templateUrl: './reception-location.component.html',
  styleUrl: './reception-location.component.scss',
})
export class ReceptionLocationComponent implements AfterViewInit, OnDestroy {
  private static readonly imageTimeoutMs = 6000;

  images = [
    'images/reception/location/location-04.jpg',
    'images/reception/location/location-02.jpg',
    'images/reception/location/location-06.jpg',
  ];
  currentImageIndex = 0;

  private imageRotationSub!: Subscription;
  private scrollSub!: Subscription;

  @ViewChild('p1', { static: true }) p1!: ElementRef;
  @ViewChild('p2', { static: true }) p2!: ElementRef;
  @ViewChild('p3', { static: true }) p3!: ElementRef;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    this.imageRotationSub = interval(
      ReceptionLocationComponent.imageTimeoutMs
    ).subscribe(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.images.length;
    });

    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16))
      .subscribe((e) => {
        this.observeParagraphs(e);
      });
  }

  ngOnDestroy(): void {
    this.imageRotationSub?.unsubscribe();
    this.scrollSub?.unsubscribe();
  }

  private observeParagraphs(e: ScrollEvent): void {
    const paragraphs = [this.p1, this.p2, this.p3];

    for (let index = 0; index < paragraphs.length; index++) {
      const paragraph = paragraphs[index];
      const position = this.platformService.positionYInViewport(
        paragraph.nativeElement
      );

      const el = paragraph.nativeElement;

      if (position === 'visible' && !el.classList.contains('visible')) {
        el.classList.add('visible');
      } else if (position === 'below' && el.classList.contains('visible')) {
        el.classList.remove('visible');
      }
    }
  }
}
