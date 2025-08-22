import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, timer } from 'rxjs';
import { EventService, FlashMessage } from '../../services/event.service';

@Component({
  selector: 'app-flash-message',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.scss'],
})
export class FlashMessageComponent implements AfterViewInit, OnDestroy {
  visible = false;

  // current toast state
  current: Required<
    Pick<FlashMessage, 'type' | 'dismissible' | 'autoHide' | 'hideAfterMs'>
  > & {
    message?: string;
    i18nKey?: string;
    i18nParams?: Record<string, unknown>;
  } = {
    type: 'info',
    dismissible: true,
    autoHide: true,
    hideAfterMs: 3000,
    message: undefined,
    i18nKey: undefined,
    i18nParams: undefined,
  };

  private sub?: Subscription;
  private hideSub?: Subscription;

  constructor(
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.sub = this.eventService.flashMask$.subscribe((flash: FlashMessage) => {
      // Small microtask to avoid ExpressionChangedAfterItHasBeenChecked errors
      Promise.resolve().then(() => this.show(flash));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.hideSub?.unsubscribe();
  }

  /** Show a new toast and set up autohide if requested */
  private show(flash: FlashMessage) {
    // cancel any previous autohide timer
    this.hideSub?.unsubscribe();

    // merge defaults
    this.current = {
      type: flash.type,
      dismissible: flash.dismissible ?? true,
      autoHide: flash.autoHide ?? true,
      hideAfterMs: flash.hideAfterMs ?? 3000,
      i18nKey: flash.i18nKey,
      i18nParams: flash.i18nParams,
    };

    this.visible = true;

    // start autohide
    if (this.current.autoHide && this.current.hideAfterMs > 0) {
      this.hideSub = timer(this.current.hideAfterMs).subscribe(() =>
        this.close()
      );
    }

    this.cdr.detectChanges();
  }

  /** Manually close the toast (also used by the × button) */
  close() {
    this.hideSub?.unsubscribe();
    this.visible = false;
    this.cdr.detectChanges();
  }
}
