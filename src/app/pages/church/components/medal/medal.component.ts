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
import { Subscription, throttleTime, Subject, takeUntil, Observable, withLatestFrom } from 'rxjs';
import { HorizontalMovingBackgroundComponent } from '../../../../components/horizontal-moving-background/horizontal-moving-background.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-medal',
  imports: [TranslateModule, HorizontalMovingBackgroundComponent, AsyncPipe],
  templateUrl: './medal.component.html',
  styleUrl: './medal.component.scss',
  standalone: true,
})
export class MedalComponent implements AfterViewInit, OnDestroy {
  private scrollEventSubscription!: Subscription;
  private destroy$ = new Subject<void>();

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

  public isMobile$!: Observable<boolean>;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {
    this.isMobile$ = this.eventService.isMobile$;
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.isMobile$.pipe(takeUntil(this.destroy$)).subscribe((isMobile) => {
      if (isMobile) {
        this.maxScale = 1.0; // Adjust max scale for mobile
      }else{
        this.maxScale = 1.2;
      }
    });

    this.scrollEventSubscription = this.eventService.scrollEvent$
      .pipe(
        throttleTime(16),
        withLatestFrom(this.isMobile$),
        takeUntil(this.destroy$)
      ) // Throttle to ~60 FPS
      .subscribe(([e, isMobile]) => {
        this.animate(e, isMobile);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private animate(e: ScrollEvent, isMobile: boolean) {
    const imageContainerEl = this.imageContainerRef.nativeElement;
    const descriptionLeftEl = this.descriptionLeftRef.nativeElement;
    const descriptionRightEl = this.descriptionRightRef.nativeElement;

    let domRect: DOMRect;
    if (isMobile) {
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

    if (!isMobile) {
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
