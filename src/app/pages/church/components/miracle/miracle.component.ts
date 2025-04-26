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

  private scrollSubscription!: Subscription;

  constructor(
    private platform: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platform.isBrowser()) return;

    this.scrollSubscription = this.eventService.scrollEvent$.subscribe((scrollY: number) => {
      this.updateParallax(scrollY);
    });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

  private updateParallax(scrollY: number) {
    const el = this.miracleImageRef?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;

    if (sectionTop < window.innerHeight && sectionTop > -sectionHeight) {
      const scrollPercent = 1 - (sectionTop / window.innerHeight);

      const translateY = scrollPercent * 50; // move max 50px
      const scale = 1 + scrollPercent * 0.05; // zoom max +5%

      el.style.transform = `translateY(${translateY}px) scale(${scale})`;
    }
  }
}
