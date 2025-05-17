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

  @ViewChild('horizontalScrollBg', { static: false })
  descriptionLeftRef!: ElementRef<HTMLElement>;

  upTranslate = 0;
  downTranslate = 0;

  private scrollSub!: Subscription;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (event: ScrollEvent) => {
        if (
          !this.platformService.isVisible(this.descriptionLeftRef.nativeElement)
        )
          return; // Ensure this runs only in the browser

        const direction = event.scrollDirection();
        const delta = Math.min(Math.abs(event.scrollYOffset), 2); // tune speed

        if (direction === 'down') {
          this.upTranslate += delta; // move right
          this.downTranslate -= delta; // move left
        } else {
          this.upTranslate -= delta; // move left
          this.downTranslate += delta; // move right
        }

        // Cap movement so text goes off-screen and returns
        this.upTranslate = this.clamp(this.upTranslate, -100, 100);
        this.downTranslate = this.clamp(this.downTranslate, -100, 100);
      }
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }
}
