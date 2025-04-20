import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GalleryStatus{
  isOpen: boolean;
  currentIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  private ringScrollEnabledSubject = new BehaviorSubject<boolean>(true);
  ringScrollEnabled$ = this.ringScrollEnabledSubject.asObservable();

  emitRingScrollEnabled(enabled: boolean): void {
    this.ringScrollEnabledSubject.next(enabled);
  }

  constructor() { }
}
