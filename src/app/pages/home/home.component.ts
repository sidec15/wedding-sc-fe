import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderService } from '../../services/header.service';
import { PlatformService } from '../../services/platform.service';
import { EventService } from '../../services/event.service';
import { Subscription, timer } from 'rxjs';
import { DateTime } from 'luxon';
import { NgTemplateOutlet } from '@angular/common';
import { HeaderBgFillObserverDirective } from '../../directives/header-bg-fill-observer.directive';

@Component({
  selector: 'app-home',
  imports: [
    TranslateModule,
    NgTemplateOutlet,
    HeaderBgFillObserverDirective
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  countdown = {
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  };

  isMobile = false;

  private timerSub!: Subscription;
  private targetDate = DateTime.fromObject(
    { year: 2025, month: 10, day: 10, hour: 15 },
    { zone: 'Europe/Rome' }
  );

  constructor(
    private platformService: PlatformService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.platformService.isPlatformReady()) return;
    this.timerSub = timer(0, 1000).subscribe(() => this.updateCountdown());
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;
    this.isMobile = this.platformService.isMobile();
    this.cdr.detectChanges(); // force DOM to re-evaluate *ngIf
    if (this.isMobile) {
      this.headerService.disable(); // Disable header animation on home page
    }
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
    // this.eventService.emitHeaderBackgroundFillEvent(false); // Emit event to reset header background
    if (this.isMobile) this.headerService.enable(); // Re-enable header animation when leaving home page
  }

  private updateCountdown(): void {
    try {
      const now = DateTime.now().setZone('Europe/Rome');
      const diff = this.targetDate
        .diff(now, ['days', 'hours', 'minutes', 'seconds'])
        .toObject();

      if (!diff || diff.seconds! < 0) {
        this.countdown = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        };
        return;
      }

      this.countdown = {
        days: String(Math.floor(diff.days ?? 0)).padStart(2, '0'),
        hours: String(Math.floor(diff.hours ?? 0)).padStart(2, '0'),
        minutes: String(Math.floor(diff.minutes ?? 0)).padStart(2, '0'),
        seconds: String(Math.floor(diff.seconds ?? 0)).padStart(2, '0'),
      };
    } catch (err) {
      console.error('Countdown error:', err);
    }
  }
}
