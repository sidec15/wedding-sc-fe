import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../../../services/platform.service';
import { EventService, ScrollEvent } from '../../../../services/event.service';

@Component({
  selector: 'app-reception-intro',
  imports: [TranslateModule, ParallaxImageComponent],
  templateUrl: './reception-intro.component.html',
  styleUrl: './reception-intro.component.scss',
})
export class ReceptionIntroComponent implements AfterViewInit, OnDestroy {
  private scrollSub!: Subscription;

  @ViewChild('heroSection', { static: false })
  heroSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('heroContent', { static: false })
  heroContentRef!: ElementRef<HTMLElement>;

  private heroHeight = 300; // fallback value

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;
    const heroSection = this.heroSectionRef?.nativeElement;
    if (heroSection) {
      this.heroHeight = heroSection.offsetHeight;
    }

    // Subscribe to scroll events
    this.scrollSub = this.eventService.scrollEvent$.subscribe((scrollEvent) => {
      if (this.heroContentRef) {
        this.animateHero(scrollEvent.scrollY);
      }
    });
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }

  private animateHero(scrollY: number) {
    if (!this.heroContentRef) return;

    // Make opacity go to 0 faster by increasing the scrollY factor
    const fadeSpeed = 1.5; // Increase for faster fade
    const t = Math.min((scrollY * fadeSpeed) / this.heroHeight, 1);
    const opacity = 1 - t; // linear fade, but faster
    const translateY = Math.min(scrollY * 0.05, 30);

    const el = this.heroContentRef.nativeElement;
    el.style.opacity = `${opacity}`;
    el.style.transform = `translate(-50%, -50%) translateY(${translateY}px)`;
  }
}
