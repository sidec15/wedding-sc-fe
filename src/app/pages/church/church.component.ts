import {
  Component,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import Lenis from 'lenis';
import { TranslateModule } from '@ngx-translate/core';
import { IntroComponent } from './components/intro/intro.component';
import { PlatformService } from '../../services/platform.service';
import { EventService } from './services/event.service';
import { OriginsComponent } from './components/origins/origins.component';

@Component({
  selector: 'app-church',
  standalone: true,
  imports: [TranslateModule, IntroComponent, OriginsComponent],
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
  providers: [EventService],
})
export class ChurchComponent implements AfterViewInit, OnDestroy {
  private lenis!: Lenis;
  private rafId = 0;
  private isBrowser: boolean;

  constructor(
    platformService: PlatformService,
    private eventService: EventService
  ) {
    this.isBrowser = platformService.isBrowser();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.lenis = new Lenis({
      duration: 2.5,
      // smooth: true,
    });

    const raf = (time: number) => {
      this.lenis.raf(time);

      // Get scroll position from Lenis
      const scrollY = this.lenis.scroll;

      // Emit scroll event with scroll position
      this.eventService.emitScrollEvent(scrollY);

      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      cancelAnimationFrame(this.rafId);
      this.lenis.destroy();
    }
  }
}
