import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';
import { EventService, ScrollEvent } from '../../../../services/event.service';

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

    this.scrollSubscription = this.eventService.scrollEvent$.subscribe((scrollEvent: ScrollEvent) => {
      //todo_here
    });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

}
