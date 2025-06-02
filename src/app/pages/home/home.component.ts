import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderService } from '../../services/header.service';
import { PlatformService } from '../../services/platform.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-home',
  imports: [TranslateModule],
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

  private intervalId: any;
  private targetDate = new Date('2025-10-10T15:00:00');

  constructor(
    private platformService: PlatformService,
    private headerService: HeaderService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.updateCountdown();
    // this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngAfterViewInit(): void {
    this.eventService.emitHeaderBackgroundEvent(true); // Emit event to fill header background
    if (this.platformService.isMobile()) {
      this.headerService.disable(); // Disable header animation on home page
    }
  }

  ngOnDestroy(): void {
    // clearInterval(this.intervalId); // Clear the countdown interval
    this.eventService.emitHeaderBackgroundEvent(false); // Emit event to reset header background
    if (this.platformService.isMobile()) this.headerService.enable(); // Re-enable header animation when leaving home page
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.targetDate.getTime() - now;

    if (distance <= 0) {
      clearInterval(this.intervalId);
      this.countdown = {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
      };
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    this.countdown = {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  }
}
