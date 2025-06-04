import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private scrollEventSubject = new BehaviorSubject<ScrollEvent>(
    new ScrollEvent(0, 0)
  );
  scrollEvent$ = this.scrollEventSubject.asObservable();

  private swipeCloseEventSubject = new BehaviorSubject<SwipeCloseEvent>(
    new SwipeCloseEvent(0)
  );
  swipeCloseEvent$ = this.swipeCloseEventSubject.asObservable();

  private resizeEventSubject = new BehaviorSubject<void>(undefined);
  resizeEvent$ = this.resizeEventSubject.asObservable();

  private menuEventSubject = new BehaviorSubject<MenuEvent>(new MenuEvent());
  menuEvent$ = this.menuEventSubject.asObservable();

  private headerBackgroundSubject = new BehaviorSubject<HeaderBackgroundEvent>(
    new HeaderBackgroundEvent(false)
  );
  headerBackgroundSubject$ = this.headerBackgroundSubject.asObservable();

  emitScrollEvent(scrollY: number, scrollYOffset: number): void {
    this.scrollEventSubject.next(new ScrollEvent(scrollY, scrollYOffset));
  }

  emitSwipeCloseEvent(swipeXOffset: number): void {
    this.swipeCloseEventSubject.next(new SwipeCloseEvent(swipeXOffset));
  }

  emitResizeEvent(): void {
    this.resizeEventSubject.next();
  }

  emitMenuEvent(event: MenuEvent): void {
    this.menuEventSubject.next(event);
  }

  emitHeaderBackgroundFillEvent(fillBackground: boolean): void {
    this.headerBackgroundSubject.next(
      new HeaderBackgroundEvent(fillBackground)
    );
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

/**
 * Event emitted when a swipe close action is detected.
 * This event contains information about the swipe close action.
 * A close action is triggered when the user swipes from right to left
 */
export class SwipeCloseEvent {
  swipeXOffset: number;

  constructor(swipeXOffset: number) {
    this.swipeXOffset = swipeXOffset;
  }
}

export class MenuEvent {
  status: 'openStart' | 'openEnd' | 'closeStart' | 'closeEnd' = 'openStart';
}

export class HeaderBackgroundEvent {
  fillBackground: boolean;

  constructor(fillBackground: boolean) {
    this.fillBackground = fillBackground;
  }
}
