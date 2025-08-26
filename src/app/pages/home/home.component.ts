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
import { Subscription, timer } from 'rxjs';
import { DateTime } from 'luxon';
import { NgTemplateOutlet } from '@angular/common';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-home',
  imports: [TranslateModule, NgTemplateOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  countdown = { days: '00', hours: '00', minutes: '00', seconds: '00' };
  isMobile = false;

  private timerSub!: Subscription;
  private targetDate = DateTime.fromObject(
    { year: 2025, month: 10, day: 10, hour: 15 },
    { zone: 'Europe/Rome' }
  );

  constructor(
    private platformService: PlatformService,
    private headerService: HeaderService,
    private menuService: MenuService,
  ) {}

  ngOnInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    // 1) Decide layout before first render
    this.isMobile = this.platformService.isMobile();

    // 2) Do one initial compute (no error)
    this.updateCountdown();

    // 3) Start ticking AFTER first render to avoid NG0100
    this.timerSub = timer(1000, 1000).subscribe(() => this.updateCountdown());
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  toggleMenu(): void {
    this.menuService.toggleMenu();
  }

  private updateCountdown(): void {
    try {
      const now = DateTime.now().setZone('Europe/Rome');
      const diff = this.targetDate
        .diff(now, ['days', 'hours', 'minutes', 'seconds'])
        .toObject();

      if (
        !diff ||
        (diff.days ?? 0) +
          (diff.hours ?? 0) +
          (diff.minutes ?? 0) +
          (diff.seconds ?? 0) <
          0
      ) {
        this.countdown = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        };
        return;
      }

      this.countdown = {
        days: String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2, '0'),
        hours: String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(
          2,
          '0'
        ),
        minutes: String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(
          2,
          '0'
        ),
        seconds: String(Math.max(0, Math.floor(diff.seconds ?? 0))).padStart(
          2,
          '0'
        ),
      };
    } catch (err) {
      console.error('Countdown error:', err);
    }
  }
}
