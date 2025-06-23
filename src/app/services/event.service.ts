import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { constants } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  // the difference between Subject and BehaviorSubject is that
  // BehaviorSubject requires an initial value and always emits the current value

  private languageChangedSubject = new Subject<string>();
  languageChanged$ = this.languageChangedSubject.asObservable();

  private scrollEventSubject = new Subject<ScrollEvent>();
  scrollEvent$ = this.scrollEventSubject.asObservable();

  private ringScrollEnabledSubject = new Subject<boolean>();
  ringScrollEnabled$ = this.ringScrollEnabledSubject.asObservable();

  private swipeCloseEventSubject = new Subject<SwipeCloseEvent>();
  swipeCloseEvent$ = this.swipeCloseEventSubject.asObservable();

  private resizeEventSubject = new BehaviorSubject<void>(undefined);
  resizeEvent$ = this.resizeEventSubject.asObservable();

  private menuEventSubject = new Subject<MenuEvent>();
  menuEvent$ = this.menuEventSubject.asObservable();

  private headerBackgroundSubject = new Subject<HeaderBackgroundEvent>();
  headerBackgroundSubject$ = this.headerBackgroundSubject.asObservable();

  private galleryStatusSubject = new BehaviorSubject<GalleryStatus>({
    isOpen: false,
    currentIndex: 0,
  });
  galleryStatus$ = this.galleryStatusSubject.asObservable();

  private loadingMaskSubject = new BehaviorSubject<boolean>(false);
  loadingMask$ = this.loadingMaskSubject.asObservable();

  emitLanguageChanged(language: string): void {
    this.languageChangedSubject.next(language);
  }

  emitGalleryStatus(status: GalleryStatus): void {
    this.galleryStatusSubject.next(status);
  }

  emitScrollEvent(scrollY: number, scrollYOffset: number): void {
    this.scrollEventSubject.next(new ScrollEvent(scrollY, scrollYOffset));
  }

  emitRingScrollEnabled(enabled: boolean): void {
    this.ringScrollEnabledSubject.next(enabled);
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

  /**
   * Emit an event to reset the header background fill state.
   * This is useful when the header background should be reset to its initial state.
   */
  emitHeaderBackgroundFillResetEvent(): void {
    this.headerBackgroundSubject.next(
      new HeaderBackgroundEvent(constants.IS_HEADER_FILLED)
    );
  }

  emitLoadingMask(visible: boolean): void {
    this.loadingMaskSubject.next(visible);
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

export interface GalleryStatus {
  isOpen: boolean;
  currentIndex: number;
}
