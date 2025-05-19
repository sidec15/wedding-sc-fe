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
})
export class HorizontalMovingBackgroundComponent
  implements AfterViewInit, OnDestroy
{
  upText = input.required<string>();
  downText = input.required<string>();

  upOffset = input<string>('0px');
  downOffset = input<string>('0px');

  zIndex = input<number>(0);
  opacity = input<number>(0.5);
  translateYValue = input<string>('50%');

  upTranslate = signal<string>('0px');
  downTranslate = signal<string>('0px');

  @ViewChild('scrollWrapper', { static: false })
  scrollWrapperRef!: ElementRef<HTMLElement>;

  private scrollSub?: Subscription;
  private upCurrentOffset = 0; // in px
  private downCurrentOffset = 0; // in px

  private scrollSpeedFactor = 0.3; // Tune this for speed

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    if(!this.platformService.isBrowser()) return;

    // Start from normalized base offsets
    this.upTranslate.set(this.upOffset());
    this.downTranslate.set(this.downOffset());

    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (event: ScrollEvent) => {
        if(!this.platformService.isVisible(this.scrollWrapperRef.nativeElement)) return;

        const delta = event.scrollYOffset;

        // Increment offsets (up goes right, down goes left)
        this.upCurrentOffset += delta * this.scrollSpeedFactor;
        this.downCurrentOffset -= delta * this.scrollSpeedFactor;

        // Compose final values
        this.upTranslate.set(
          `calc(${this.upOffset()} + ${this.upCurrentOffset}px)`
        );
        this.downTranslate.set(
          `calc(${this.downOffset()} + ${this.downCurrentOffset}px)`
        );
      }
    );
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }
}
