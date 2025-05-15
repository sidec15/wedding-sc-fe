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
export class IntroComponent implements AfterViewInit, OnInit, OnDestroy {
  private scrollEventSubscription!: Subscription;
  private heroHeight = 300; // fallback value

  @ViewChild('heroOverlay', { static: false })
  heroOverlayRef!: ElementRef<HTMLElement>;
  @ViewChild('heroSection', { static: false })
  heroSectionRef!: ElementRef<HTMLElement>;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;
    const heroSection = this.heroSectionRef?.nativeElement;
    if (heroSection) {
      this.heroHeight = heroSection.offsetHeight;
    }
  }

  ngOnInit(): void {
    if (!this.platformService.isBrowser()) return;

    // Subscribe to scroll events
    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (scrollEvent) => {
        if (this.heroOverlayRef) {
          this.animateHero(scrollEvent.scrollY);
        }
      }
    );

  }

  ngOnDestroy(): void {
    if (this.platformService.isBrowser()) {
      this.scrollEventSubscription?.unsubscribe();
    }
  }

  private animateHero(scrollY: number) {
    if (!this.heroOverlayRef) return;

    const opacity = Math.max(0, 1 - scrollY / this.heroHeight);
    const translateY = Math.min(scrollY * 0.05, 30);

    const el = this.heroOverlayRef.nativeElement;
    el.style.opacity = `${opacity}`;
    el.style.transform = `translate(-50%, -50%) translateY(${translateY}px)`;
  }

}
