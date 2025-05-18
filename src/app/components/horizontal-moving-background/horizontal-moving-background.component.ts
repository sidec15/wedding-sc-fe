import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService, ScrollEvent } from '../../services/event.service';
import { PlatformService } from '../../services/platform.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-horizontal-moving-background',
  imports: [TranslateModule, NgStyle],
  templateUrl: './horizontal-moving-background.component.html',
  styleUrl: './horizontal-moving-background.component.scss',
})
export class HorizontalScrollTextComponent implements AfterViewInit, OnDestroy {
  upText = input.required<string>();
  downText = input.required<string>();

  translateYValue = input<string>('50%');
  zIndex = input<number>(0);
  opacity = input<number>(0.5);

  @ViewChild('scrollWrapper', { static: false })
  scrollWrapperRef!: ElementRef<HTMLElement>;

  upTranslate = 0;
  downTranslate = 0;

  private scrollSub!: Subscription;
  private componentCenterY = 0;
  private maxTranslation = 50; // % shift when far from center

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    const wrapper = this.scrollWrapperRef.nativeElement;
    const upEl = wrapper.querySelector('.text-row.up') as HTMLElement;
    const downEl = wrapper.querySelector('.text-row.down') as HTMLElement;

    let hasInitializedCenter = false;
    let centerOffsetUp = 0;
    let centerOffsetDown = 0;

    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (event: ScrollEvent) => {
        if (!this.platformService.isVisible(wrapper)) return;

        if (!hasInitializedCenter) {
          // 1. Compute vertical center of component
          const wrapperRect = wrapper.getBoundingClientRect();
          const scrollTop =
            window.scrollY || document.documentElement.scrollTop;
          const elementTop = wrapperRect.top + scrollTop;
          const elementHeight = wrapperRect.height;
          this.componentCenterY = elementTop + elementHeight / 2;

          // 2. Compute horizontal center of viewport
          const viewportCenterX = window.innerWidth / 2;

          // 3. Compute real center of UP text
          const upRect = upEl.getBoundingClientRect();
          const upLeft = upRect.left + window.scrollX;
          const upCenterX = upLeft + upRect.width / 2;
          centerOffsetUp = viewportCenterX - upCenterX;

          // 4. Compute real center of DOWN text
          const downRect = downEl.getBoundingClientRect();
          const downLeft = downRect.left + window.scrollX;
          const downCenterX = downLeft + downRect.width / 2;
          centerOffsetDown = viewportCenterX - downCenterX;

          hasInitializedCenter = true;
        }

        // 5. Scroll progress based on distance from vertical center
        const viewportHeight = window.innerHeight;
        const viewportCenterY = event.scrollY + viewportHeight / 2;
        const distanceFromCenter = viewportCenterY - this.componentCenterY;

        // 6. Normalize scroll distance to [-1, 1] range
        const normalized = Math.max(
          -1,
          Math.min(1, distanceFromCenter / viewportHeight)
        );

        // 7. Final transform
        this.upTranslate = centerOffsetUp * normalized;
        this.downTranslate = centerOffsetDown * normalized;
      }
    );
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }
}
