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
  
    const move = scrollY * 0.03; // Small soft parallax
    titleBgEl.style.transform = `translate(-50%, calc(-50% + ${move}px))`;
  }
  

}
