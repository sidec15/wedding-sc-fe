import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';
import { EventService } from '../../../../services/event.service';

@Component({
  selector: 'app-miracle',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('miracleImage', { static: false }) miracleImageRef!: ElementRef<HTMLElement>;
  @ViewChild('miracleTitleBackground', { static: false }) miracleTitleBackgroundRef!: ElementRef<HTMLElement>;

  private scrollSubscription!: Subscription;

  constructor(
    private platform: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platform.isBrowser()) return;

    this.scrollSubscription = this.eventService.scrollEvent$.subscribe((scrollY: number) => {
      // this.updateParallax(scrollY);
      this.updateTitleParallax(scrollY);
    });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

  private updateTitleParallax(scrollY: number) {
    const titleBgEl = this.miracleTitleBackgroundRef?.nativeElement;
    if (!titleBgEl) return;

    // Adjust the multiplier to reduce the movement
    const move = Math.min(scrollY * 0.01, 30); // Limit the movement to a maximum of 30px
    titleBgEl.style.transform = `translate(-50%, calc(-50% + ${move}px))`;
  }
}
