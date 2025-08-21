import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type FlashType = 'success' | 'error' | 'info' | 'warning';

export interface FlashMessage {
  type: FlashType;
  message: string;
  autoHide?: boolean;
  hideAfterMs?: number;
  dismissible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FlashService {
  private flashSubject = new Subject<FlashMessage>();
  flash$ = this.flashSubject.asObservable();

  show(flash: FlashMessage) {
    this.flashSubject.next(flash);
  }
}
