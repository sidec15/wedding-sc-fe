import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private scrollEventSubject = new BehaviorSubject<ScrollEvent>({scrollY: 0, scrollYOffset: 0});
  scrollEvent$ = this.scrollEventSubject.asObservable();

  emitScrollEvent(scrollY: number, scrollYOffset: number): void {
    this.scrollEventSubject.next({ scrollY, scrollYOffset });
  }
}

export interface ScrollEvent {
  scrollY: number;
  scrollYOffset: number;
}
