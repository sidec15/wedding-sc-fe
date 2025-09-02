import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService, ThemeMessage } from '../../services/event.service';
import { Theme } from '../../models/theme';
import { ThemeService } from '../../services/theme.service';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { GuestsDayInfoComponent } from './components/guests-day-info/guests-day-info.component';
import { GuestsDirectionsChurchComponent } from './components/guests-directions-church/guests-directions-church.component';
import { GuestsDirectionsReceptionComponent } from './components/guests-directions-reception/guests-directions-reception.component';
import { GuestsIntroComponent } from './components/guests-intro/guests-intro.component';
import { GuestsSaveTheDateComponent } from './components/guests-save-the-date/guests-save-the-date.component';

@Component({
  selector: 'app-guests',
  imports: [
    GuestsIntroComponent,
    GuestsDirectionsChurchComponent,
    GuestsDirectionsReceptionComponent,
    GuestsSaveTheDateComponent,
    GuestsDayInfoComponent,
    RingScrollComponent,
  ],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss',
})
export class GuestsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Option A: keep static: false and use ngAfterViewInit
  @ViewChild('wrapper', { static: false }) wrapperRef!: ElementRef<HTMLElement>;
  // Option B: { static: true } and you can use ngOnInit (pick one approach)

  private themeSub?: Subscription;

  constructor(
    private eventService: EventService,
    private themService: ThemeService // (name ok even if typo)
  ) {}

  ngOnInit(): void {
    const currentTheme = this.themService.getCurrentThemeToApply();
    console.debug('[Guests] ngOnInit() currentTheme =', currentTheme);

    // Subscribe to live theme changes
    this.themeSub = this.eventService.theme$.subscribe((e: ThemeMessage) => {
      console.debug('[Guests] theme$ emitted:', e);
      this.handleTheme(e.theme);
    });
  }

  ngAfterViewInit(): void {
    // Apply initial theme AFTER the ViewChild exists
    const currentTheme = this.themService.getCurrentThemeToApply();
    console.debug(
      '[Guests] ngAfterViewInit() applying initial theme:',
      currentTheme
    );

    this.handleTheme(currentTheme);
  }

  ngOnDestroy(): void {
    console.debug('[Guests] ngOnDestroy() unsubscribing theme$');
    this.themeSub?.unsubscribe();
  }

  private handleTheme(theme: Theme) {
    if (!this.wrapperRef) {
      console.warn('[Guests] handleTheme called before wrapperRef exists');
      return;
    }
    const el = this.wrapperRef.nativeElement;
    if (!el) {
      console.warn('[Guests] wrapperRef.nativeElement is null');
      return;
    }

    const add = theme === Theme.Dark;
    console.debug(
      '[Guests] handleTheme -> toggling dark:',
      add,
      'on element:',
      el
    );

    if (add) {
      if (!el.classList.contains('dark')) {
        el.classList.add('dark');
        console.debug('[Guests] .dark ADDED');
      } else {
        console.debug('[Guests] .dark already present');
      }
    } else {
      if (el.classList.contains('dark')) {
        el.classList.remove('dark');
        console.debug('[Guests] .dark REMOVED');
      } else {
        console.debug('[Guests] .dark already absent');
      }
    }
  }
}
