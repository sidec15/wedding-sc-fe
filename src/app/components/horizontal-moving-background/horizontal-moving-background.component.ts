import {
  Component,
  AfterViewInit,
  OnDestroy,
  signal,
  input,
  ElementRef,
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
  standalone: true,
})
export class HorizontalMovingBackgroundComponent
  implements AfterViewInit, OnDestroy
{
  upText = input.required<string>();
  downText = input.required<string>();

  upOffset = input<string>('0px');
  downOffset = input<string>('0px');

  zIndex = input<number>(0);
  translateYValue = input<string>('50%');
  speedFactor = input<number>(0.3); // Tune this for speed
  maxOpacity = input<number>(0.8);

  upTranslate = signal<string>('0px');
  downTranslate = signal<string>('0px');
  upOpacity = signal<number>(0); // starts at 0
  downOpacity = signal<number>(0); // starts at 0

  @ViewChild('scrollWrapper', { static: false })
  scrollWrapperRef!: ElementRef<HTMLElement>;

  private scrollSub?: Subscription;
  private upCurrentOffset = 0; // in px
  private downCurrentOffset = 0; // in px

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    // Set initial horizontal offsets
    this.upTranslate.set(this.upOffset());
    this.downTranslate.set(this.downOffset());

    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (event: ScrollEvent) => {
        const delta = event.scrollYOffset;

        const wrapper = this.scrollWrapperRef.nativeElement;
        if (!this.platformService.isVisible(wrapper)) return;

        this.updateHorizontalOffsets(delta);
        this.updateOpacityBasedOnDistanceToCenter(wrapper);
      }
    );
  }

  /**
   * Adjusts horizontal positions of the up/down texts based on scroll delta.
   */
  private updateHorizontalOffsets(delta: number): void {
    const factor = this.speedFactor();

    this.upCurrentOffset += delta * factor;
    this.downCurrentOffset -= delta * factor;

    this.upTranslate.set(
      `calc(${this.upOffset()} + ${this.upCurrentOffset}px)`
    );
    this.downTranslate.set(
      `calc(${this.downOffset()} + ${this.downCurrentOffset}px)`
    );
  }

  /**
   * Computes and sets a shared opacity for both text rows based on their individual
   * horizontal distance from the center of the screen.
   * The closest element to the center determines the opacity.
   */
  private updateOpacityBasedOnDistanceToCenter(wrapper: HTMLElement): void {
    const screenCenterX = window.innerWidth / 2;

    const upEl = wrapper.querySelector('.text-row.up') as HTMLElement;
    const downEl = wrapper.querySelector('.text-row.down') as HTMLElement;
    if (!upEl || !downEl) return;

    const upRect = upEl.getBoundingClientRect();
    const downRect = downEl.getBoundingClientRect();

    const upCenterX = upRect.left + upRect.width / 2;
    const downCenterX = downRect.left + downRect.width / 2;

    const upDistance = Math.abs(upCenterX - screenCenterX);
    const downDistance = Math.abs(downCenterX - screenCenterX);

    // Normalize by half width of the element (so fully faded at 1x width away)
    const upRatio = upDistance / (upRect.width / 2);
    const downRatio = downDistance / (downRect.width / 2);

    const minRatio = Math.min(upRatio, downRatio);
    const clampedRatio = Math.min(1, minRatio);

    const sharedOpacity = Math.max(0, (1 - clampedRatio) * this.maxOpacity());

    this.upOpacity.set(sharedOpacity);
    this.downOpacity.set(sharedOpacity);
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }
}
