import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class EventService {
  private scrollEventSubject = new BehaviorSubject<number>(0);
  scrollEvent$ = this.scrollEventSubject.asObservable();

  emitScrollEvent(scrollY: number): void {
    this.scrollEventSubject.next(scrollY);
  }
}
