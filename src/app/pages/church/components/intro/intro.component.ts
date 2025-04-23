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

@Component({
  selector: 'app-intro',
  imports: [TranslateModule],
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements AfterViewInit, OnInit, OnDestroy {
  private scrollEventSubscription!: Subscription;
  private heroHeight = 300; // fallback value
  // private imageChangeIntervalSubscription!: Subscription;

  @ViewChild('heroOverlay', { static: false })
  heroOverlayRef!: ElementRef<HTMLElement>;
  @ViewChild('heroSection', { static: false })
  heroSectionRef!: ElementRef<HTMLElement>;

  // // Array of hero images
  // heroImages: string[] = [
  //   '/images/church/intro/church-02.jpg',
  //   '/images/church/intro/church-01.jpg',
  //   '/images/church/intro/church-03.jpg',
  // ];
  // currentImageIndex = 0;

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
      (scrollY) => {
        if (this.heroOverlayRef) {
          this.animateHero(scrollY);
        }
      }
    );

    // Start the image change timer
    // this.startImageChangeTimer();
  }

  ngOnDestroy(): void {
    if (this.platformService.isBrowser()) {
      this.scrollEventSubscription?.unsubscribe();
      // this.imageChangeIntervalSubscription?.unsubscribe();
    }
  }

  private animateHero(scrollY: number) {
    if (!this.heroOverlayRef) return;

    const opacity = Math.max(0, 1 - scrollY / this.heroHeight);
    const translateY = Math.min(scrollY * 0.05, 30);

    const el = this.heroOverlayRef.nativeElement;
    el.style.opacity = `${opacity}`;
    el.style.transform = `translateY(${translateY}px)`;
  }

  // private startImageChangeTimer(): void {
  //   // Change the image every 5 seconds
  //   this.imageChangeIntervalSubscription = interval(5000).subscribe(() => {
  //     this.currentImageIndex =
  //       (this.currentImageIndex + 1) % this.heroImages.length;

  //     // Update the hero image
  //     const heroSection = this.heroSectionRef?.nativeElement;
  //     if (heroSection) {
  //       heroSection.style.backgroundImage = `url('${this.heroImages[this.currentImageIndex]}')`;
  //     }
  //   });
  // }
}
