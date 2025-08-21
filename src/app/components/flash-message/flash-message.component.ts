import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, timer } from 'rxjs';

type FlashType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-flash-message',
  imports: [CommonModule, TranslateModule],
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.scss'],
})
export class FlashMessageComponent implements OnInit, OnDestroy {
  @Input() type: FlashType = 'info';

  /** Provide either message or i18nKey (+ i18nParams) */
  @Input() message?: string;
  @Input() i18nKey?: string;
  @Input() i18nParams?: Record<string, unknown>;

  /** Close button */
  @Input() dismissible = true;

  /** Auto-hide behavior (handled inside the component) */
  @Input() autoHide = true;
  @Input() hideAfterMs = 3000; // default 3s, matches your previous value

  /** Emits when the toast closes (auto or manual) */
  @Output() closed = new EventEmitter<void>();

  private autoHideSub?: Subscription;

  ngOnInit(): void {
    if (this.autoHide && this.hideAfterMs > 0) {
      this.autoHideSub = timer(this.hideAfterMs).subscribe(() => this.onClose());
    }
  }

  ngOnDestroy(): void {
    this.autoHideSub?.unsubscribe();
  }

  onClose(): void {
    this.autoHideSub?.unsubscribe();
    this.closed.emit();
  }
}
