import {
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription, timeout, timer } from 'rxjs';

@Component({
  selector: 'app-splash-screen',
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  private static readonly timeoutDurationMS = 5000;

  private timerSub!: Subscription;

  @HostBinding('class.hidden') isHidden = false;

  ngOnInit(): void {
    this.timerSub = timer(SplashScreenComponent.timeoutDurationMS).subscribe(() => {
      this.isHidden = true;
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  get durationMS(): number {
    return SplashScreenComponent.timeoutDurationMS;
  }
}
