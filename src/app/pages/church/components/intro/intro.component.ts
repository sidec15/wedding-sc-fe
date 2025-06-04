import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, interval } from 'rxjs';
import { EventService } from '../../../../services/event.service';
import { PlatformService } from '../../../../services/platform.service';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';

@Component({
  selector: 'app-intro',
  imports: [TranslateModule, ParallaxImageComponent],
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements AfterViewInit, OnDestroy {
  private heroHeight = 300; // fallback value

  @ViewChild('heroOverlay', { static: false })
  heroOverlayRef!: ElementRef<HTMLElement>;
  @ViewChild('heroSection', { static: false })
  heroSectionRef!: ElementRef<HTMLElement>;

  private scrollSub!: Subscription;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    // this.eventService.emitHeaderBackgroundFillEvent(true); // Ensure header background is filled

    const heroSection = this.heroSectionRef?.nativeElement;
    if (heroSection) {
      this.heroHeight = heroSection.offsetHeight;
    }

    // Subscribe to scroll events
    this.scrollSub = this.eventService.scrollEvent$.subscribe((scrollEvent) => {
      if (this.heroOverlayRef) {
        this.animateHero(scrollEvent.scrollY);
      }
      // this.updateHeaderBackgroundFill();
    });
  }

  ngOnDestroy(): void {
    // this.eventService.emitHeaderBackgroundFillEvent(false); // Reset header background state
    this.scrollSub?.unsubscribe();
  }

  private animateHero(scrollY: number) {
    if (!this.heroOverlayRef) return;

    const opacity = Math.max(0, 1 - scrollY / this.heroHeight);
    const translateY = Math.min(scrollY * 0.05, 30);

    const el = this.heroOverlayRef.nativeElement;
    el.style.opacity = `${opacity}`;
    el.style.transform = `translate(-50%, -50%) translateY(${translateY}px)`;
  }

  // private updateHeaderBackgroundFill(): void {
  //   if (this.platformService.isVisible(this.heroSectionRef?.nativeElement)) {
  //     if (this.isHeaderBgFilled) return; // No need to emit if already filled
  //     this.eventService.emitHeaderBackgroundFillEvent(true);
  //     this.isHeaderBgFilled = true;
  //   } else {
  //     if (!this.isHeaderBgFilled) return; // No need to emit if already not filled
  //     this.eventService.emitHeaderBackgroundFillEvent(false);
  //     this.isHeaderBgFilled = false;
  //   }
  // }
}
