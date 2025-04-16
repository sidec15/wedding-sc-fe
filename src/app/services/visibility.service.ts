import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  private ringScrollEnabledSubject = new BehaviorSubject<boolean>(true);
  ringScrollEnabled$ = this.ringScrollEnabledSubject.asObservable();

  setRingScrollEnabled(enabled: boolean): void {
    this.ringScrollEnabledSubject.next(enabled);
  }

  constructor() { }
}
