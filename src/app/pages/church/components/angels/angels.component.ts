import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../services/event.service';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-angels',
  imports: [TranslateModule],
  templateUrl: './angels.component.html',
  styleUrl: './angels.component.scss',
})
export class AngelsComponent implements AfterViewInit, OnDestroy {
  private scrollEventSubscription!: Subscription;

  @ViewChild('description', { static: false })
  descriptionRef!: ElementRef<HTMLElement>;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (scrollY: number) => {
        this.animateDescription(scrollY);
      }
    );
  }
  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

  private animateDescription(scrollY: number) {
    if (!this.platformService.isBrowser()) return; // Ensure this runs only in the browser
  
    const el = this.descriptionRef.nativeElement;
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
  
    // Progress from 0 (bottom of screen) to 1 (center)
    const visibleRatio = 1 - Math.min(Math.max((rect.top - windowHeight * 0.3) / (windowHeight * 0.5), 0), 1);
  
    // Clamp + ease
    const opacity = visibleRatio;
    const translateY = (1 - visibleRatio) * 40;
    const scale = 0.975 + visibleRatio * 0.025;
  
    el.style.opacity = `${opacity}`;
    el.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
  }
  
}
