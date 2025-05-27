import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { PlatformService } from '../../../../services/platform.service';
import { NgClass, NgIf } from '@angular/common';
import { EventService } from '../../../../services/event.service';
import { Subscription, throttleTime } from 'rxjs';

@Component({
  selector: 'app-miracle',
  imports: [TranslateModule, ParallaxImageComponent, NgIf, NgClass],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit, OnDestroy {
  isPlatformReady = false;
  imageSrc: string = '';

  private _isMobile = false;
  private scrollSub!: Subscription;

  @ViewChild('miracleSection', { static: false }) sectionRef!: ElementRef;
  @ViewChild('miracleText', { static: false }) textRef!: ElementRef;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    this.isPlatformReady = true;

    // Cache the isMobile flag after the view is initialized to ensure correct platform detection.
    this._isMobile = this.platformService.isMobile();

    this.imageSrc = this._isMobile
      ? '/images/church/miracle/miracle-09.jpg'
      : '/images/church/miracle/miracle-02.jpg';

    // Prevents ExpressionChangedAfterItHasBeenCheckedError.
    // Angular initially renders the component, then detects that a bound value has changed.
    // Calling detectChanges forces Angular to re-evaluate the template with the correct value.
    this.cdRef.detectChanges();

    if (!this._isMobile) return;

    // Subscribe to the scroll event stream and animate the text accordingly.
    // throttleTime(16) limits the callback to approximately 60 frames per second.
    //
    // Why use throttleTime(16)?
    // - Most screens refresh at 60Hz, which means one frame every ~16.67ms.
    // - throttleTime ensures that animateText runs no more than once per frame.
    // - This prevents unnecessary calculations, reduces layout thrashing,
    //   and helps maintain smooth and efficient animations.
    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16))
      .subscribe(() => this.animateText());
  }

  ngOnDestroy(): void {
    // Clean up the scroll subscription to avoid memory leaks.
    this.scrollSub?.unsubscribe();
  }

  // Animates the .miracle-text element based on the section’s position in the viewport.
  animateText(): void {
    const section = this.sectionRef.nativeElement as HTMLElement;
    const text = this.textRef.nativeElement as HTMLElement;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate scroll progress: 0 when fully off-screen, 1 when centered
    const progress = Math.min(Math.max(1 - rect.top / windowHeight, 0), 1);

    const translateY = 100 * (1 - progress); // from 100px to 0
    const opacity = progress; // from 0 to 1
    const scale = 0.8 + 0.2 * progress; // from 0.8 to 1

    // Apply the calculated transform and opacity to the text container.
    // translate(-50%, -50%) centers the element both vertically and horizontally.
    text.style.transform = `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`;
    text.style.opacity = `${opacity}`;
  }

  // Returns whether the platform is considered mobile.
  get isMobile(): boolean {
    return this._isMobile;
  }
}
