import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private scrollEventSubject = new BehaviorSubject<ScrollEvent>(new ScrollEvent(0, 0));
  scrollEvent$ = this.scrollEventSubject.asObservable();

  emitScrollEvent(scrollY: number, scrollYOffset: number): void {
    //debug_sdc
    console.log(`Emitting scroll event: scrollY: ${scrollY}, scrollYOffset: ${scrollYOffset}`);
    this.scrollEventSubject.next(new ScrollEvent(scrollY, scrollYOffset));
  }
}

export class ScrollEvent {
  scrollY: number;
  scrollYOffset: number;

  constructor(scrollY: number, scrollYOffset: number) {
    this.scrollY = scrollY;
    this.scrollYOffset = scrollYOffset;
  }
  
  // create a method to identify the scroll y direction according to the offset
  public scrollDirection(): 'up' | 'down' {
    return this.scrollYOffset > 0 ? 'down' : 'up';
  }
}
