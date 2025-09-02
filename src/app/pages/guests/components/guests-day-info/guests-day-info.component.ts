import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, throttleTime } from 'rxjs';
import { EventService, ScrollEvent } from '../../../../services/event.service';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-guests-day-info',
  imports: [TranslateModule],
  templateUrl: './guests-day-info.component.html',
  styleUrl: './guests-day-info.component.scss',
})
export class GuestsDayInfoComponent implements AfterViewInit, OnDestroy {
  private scrollSub!: Subscription;

  @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit(): void {
    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16))
      .subscribe((e) => {
        this.observeTimeLineItems(e);
      });
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }

  private observeTimeLineItems(e: ScrollEvent): void {
    this.timelineItems.forEach((item) => this.observeFadingUpItems(item));
    // this.times.forEach(item => this.observeFadingUpItems(item));
    // this.contents.forEach(item => this.observeFadingUpItems(item));
    // this.times.forEach(this.observeFadingUpItems);
    // this.contents.forEach(this.observeFadingUpItems);
  }

  private observeFadingUpItems(item: ElementRef) {
    const position = this.platformService.positionYInViewport(
      item.nativeElement
    );

    const el = item.nativeElement as HTMLElement;
    const animWrapper = el.querySelector('.timeline-anim');
    const timeEl = el.querySelector('.time');
    const contentEl = el.querySelector('.content');

    if (position === 'visible' && !el.classList.contains('visible')) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementMiddle = rect.top + rect.height / 2;
      const viewportMiddle = windowHeight * 0.9;

      if (elementMiddle <= viewportMiddle) {
        el.classList.add('visible');
        animWrapper?.classList.add('visible');
        timeEl?.classList.add('visible');
        contentEl?.classList.add('visible');
      }
    } else if (position === 'below' && el.classList.contains('visible')) {
      el.classList.remove('visible');
      animWrapper?.classList.remove('visible');
      timeEl?.classList.remove('visible');
      contentEl?.classList.remove('visible');
    }
  }
}
