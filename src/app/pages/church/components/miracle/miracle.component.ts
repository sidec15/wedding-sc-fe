import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { PlatformService } from '../../../../services/platform.service';
import { NgIf } from '@angular/common';
import { EventService } from '../../../../services/event.service';
import { Subscription, throttleTime } from 'rxjs';

@Component({
  selector: 'app-miracle',
  imports: [TranslateModule, ParallaxImageComponent, NgIf],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit, OnDestroy {
  private scrollSub!: Subscription;

  @ViewChild('miracleSection', { static: false }) sectionRef!: ElementRef;
  @ViewChild('miracleText', { static: false }) textRef!: ElementRef;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;
    if (!this.isMobile) return;

    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16)) // Throttle to 60 FPS, approximately every 16ms. This is really useful for performance because it prevents the animation from being triggered too frequently.
      .subscribe(() => {
        this.animateText();
      });
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }

  animateText(): void {
    const section = this.sectionRef.nativeElement as HTMLElement;
    const text = this.textRef.nativeElement as HTMLElement;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const progress = Math.min(Math.max(1 - rect.top / windowHeight, 0), 1);
    const translateY = 100 * (1 - progress);
    const opacity = progress;
    const scale = 0.8 + 0.2 * progress;

    text.style.transform = `translateY(${translateY}px) scale(${scale})`;
    text.style.opacity = `${opacity}`;
  }

  get isMobile(): boolean {
    return this.platformService.isMobile();
  }
}
