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

  private hasInitializedCenter = false;
  private centerOffsetUp = 0;
  private centerOffsetDown = 0;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.initializeCenterOffsets();

    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (event: ScrollEvent) => {
        const wrapper = this.scrollWrapperRef.nativeElement;
        if (!this.platformService.isVisible(wrapper)) return;
        if (!this.hasInitializedCenter) return;

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
        this.upTranslate = this.centerOffsetUp * normalized;
        this.downTranslate = (this.centerOffsetDown - 500) * normalized;
        console.log(
          `upTranslate: ${this.upTranslate}, downTranslate: ${this.downTranslate}`
        );
      }
    );
  }

  private initializeCenterOffsets() {
    if (this.hasInitializedCenter) return;
    const wrapper = this.scrollWrapperRef.nativeElement;
    const upEl = wrapper.querySelector('.text-row.up') as HTMLElement;
    const downEl = wrapper.querySelector('.text-row.down') as HTMLElement;

    // Wait until the elements have a width (are rendered)
    const upRect = upEl.getBoundingClientRect();
    const downRect = downEl.getBoundingClientRect();
    if (upRect.width === 0 || downRect.width === 0) {
      requestAnimationFrame(() => this.initializeCenterOffsets());
      return;
    }

    // 1. Compute vertical center of component
    const wrapperRect = wrapper.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const elementTop = wrapperRect.top + scrollTop;
    const elementHeight = wrapperRect.height;
    this.componentCenterY = elementTop + elementHeight / 2;

    // 2. Compute horizontal center of viewport
    const viewportCenterX = window.innerWidth / 2;

    // 3. Compute left edge of UP text
    const upOffset = viewportCenterX - upRect.left;

    // 4. Compute right edge of DOWN text
    const downOffset = viewportCenterX - downRect.right;

    this.centerOffsetUp = upOffset;
    this.centerOffsetDown = downOffset;

    console.log(`Center offset up: ${this.centerOffsetUp}, down: ${this.centerOffsetDown}`);

    // Set initial positions so there is no jump on first scroll
    this.upTranslate = 0;
    this.downTranslate = 0;
    this.hasInitializedCenter = true;
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }
}
