import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-global-loading-mask',
  templateUrl: './global-loading-mask.component.html',
  styleUrls: ['./global-loading-mask.component.scss'],
  imports: [TranslateModule],
})
export class GlobalLoadingMaskComponent implements AfterViewInit, OnDestroy {
  visible = false;
  private sub!: Subscription;

  constructor(private eventService: EventService) {}

  ngAfterViewInit(): void {
    this.sub = this.eventService.loadingMask$.subscribe(
      (visible: boolean) => (this.visible = visible)
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
