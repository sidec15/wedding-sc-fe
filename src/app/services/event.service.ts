import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay, Subject } from 'rxjs';
import { constants } from '../constants';
import { Theme } from '../models/theme';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LayoutType } from '../models/layout';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  /**
   * Emits the current {@link LayoutType} (e.g. `LayoutType.mobile` or `LayoutType.desktop`)
   * whenever the viewport crosses the defined breakpoint.
   *
   * - Breakpoint used: `(max-width: 768px)`
   *   - ≤ 768px → emits `LayoutType.mobile`
   *   - > 768px → emits `LayoutType.desktop`
   *
   * This observable is:
   * - **Hot**: All subscribers share the same underlying `BreakpointObserver` listener.
   * - **Replayable**: Thanks to `shareReplay(1)`, new subscribers immediately receive
   *   the latest known layout without waiting for a resize event.
   *
   * ### Example usage in a component:
   * ```ts
   * layout$ = this.eventService.layout$;
   * ```
   *
   * ```html
   * <div *ngIf="(layout$ | async) === LayoutType.mobile">
   *   Mobile layout
   * </div>
   * <div *ngIf="(layout$ | async) === LayoutType.desktop">
   *   Desktop layout
   * </div>
   * ```
   */
  readonly layout$;

  /**
   * Emits true if the current layout is mobile (width <= 768px).
   *
   * ### Example usage in a component:
   * ```ts
   * isMobile$ = this.eventService.isMobile$;
   * ```
   *
   * ### Example usage in a template:
   * ```html
   * <div *ngIf="isMobile$ | async">
   *   Mobile layout
   * </div>
   * <div *ngIf="!(isMobile$ | async)">
   *   Desktop layout
   * </div>
   * ```
   */
  readonly isMobile$;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.layout$ = this.breakpointObserver.observe(['(max-width: 768px)']).pipe(
      // Map BreakpointState → LayoutType enum
      map((result) =>
        result.matches ? LayoutType.mobile : LayoutType.desktop
      ),

      /**
       * shareReplay(1) ensures:
       * 1. All subscribers share the same resize listener (no duplicate work).
       * 2. The most recent value is replayed to new subscribers immediately.
       */
      shareReplay(1)
    );

    this.isMobile$ = this.layout$.pipe(
      map((layout) => layout === LayoutType.mobile)
    );
  }

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

  private flashSubject = new Subject<FlashMessage>();
  flashMask$ = this.flashSubject.asObservable();

  private themeSubject = new Subject<ThemeMessage>();
  theme$ = this.themeSubject.asObservable();

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

  emitFlash(flashMessage: FlashMessage): void {
    this.flashSubject.next(flashMessage);
  }

  emitThemeChange(themeMessage: ThemeMessage) {
    this.themeSubject.next(themeMessage);
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

export type FlashType = 'success' | 'error' | 'info' | 'warning';

export interface FlashMessage {
  type: FlashType;
  i18nKey?: string;
  i18nParams?: Record<string, unknown>;
  dismissible?: boolean;
  autoHide?: boolean;
  hideAfterMs?: number;
}

export interface ThemeMessage {
  theme: Theme;
}
