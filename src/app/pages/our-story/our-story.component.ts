import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../services/platform.service';
import { HeaderService } from '../../services/header.service';
import { CardsService } from './services/cards.service';
import { Card } from './models/card';
import { CommentsComponent } from './components/comments/comments.component';
import { Comment } from './components/comments/models/comment';
import { wait } from '../../utils/time.utils';
import { ActivatedRoute, Router } from '@angular/router';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { ImageFocusComponent } from '../../components/image-focus/image-focus.component';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-our-story',
  imports: [
    TranslateModule,
    CommonModule,
    CommentsComponent,
    RingScrollComponent,
    ImageFocusComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
  providers: [CardsService],
})
export class OurStoryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('navCtrl', { static: false })
  navCtrl!: ElementRef;
  @ViewChild('prevBtn', { static: false })
  prevBtn!: ElementRef;
  @ViewChild('nextBtn', { static: false })
  nextBtn!: ElementRef;
  @ViewChild('firstBtn', { static: false })
  firstBtn!: ElementRef;
  @ViewChild('lastBtn', { static: false })
  lastBtn!: ElementRef;
  @ViewChild('cardWrapper', { static: true })
  cardWrapper!: ElementRef<HTMLElement>;
  @ViewChild(ImageFocusComponent) imageFocus!: ImageFocusComponent;

  cards: Card[] = [];
  currentIndex: number = 0;
  isTransitioning: boolean = false;
  previousIndex: number = 0;
  nextIndex: number = 0;
  isMobile: boolean = false;
  showCommentsSection: boolean = true;
  isGreaterJump = false;
  showSwipeOnboarding = false;
  imageUrl = signal<string>('');

  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private swipeThreshold = 50; // px
  private swipeListenerAdded = false;
  private isMultiTouch = false;

  constructor(
    private platformService: PlatformService,
    private storycardsProvider: CardsService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.cards = this.storycardsProvider.getCards();
    // Initialize all cards with proper states
    this.initializeCardStates();
    // Initialize imageUrl with first card's image
    this.imageUrl.set(this.cards[0]?.image || '');
  }

  ngAfterViewInit(): void {
    this.isMobile = this.platformService.isMobile();
    this.headerService.setMinDistanceToShowHeader(1);

    // Focus the component for keyboard navigation
    if (this.isMobile) {
      // ✅ Defer onboarding flag to avoid ExpressionChangedAfterItHasBeenCheckedError
      if (!localStorage.getItem('ourStorySwipeOnboardingShown')) {
        setTimeout(() => {
          // Show onboarding only first time (localStorage flag)
          this.showSwipeOnboarding = true;
        }, 0);
      }

      this.addSwipeListeners();
      if (typeof window !== 'undefined') {
        const element = document.querySelector('.story-gallery');
        if (element) {
          (element as HTMLElement).focus();
        }
      }
    }

    // --- NEW: read ?cardId=... and jump without animation
    this.route.queryParamMap.subscribe((params) => {
      const idFromUrl = params.get('cardId');
      if (!idFromUrl) return;

      const idx = this.cards.findIndex((c) => c.id === idFromUrl);
      if (idx !== -1 && idx !== this.currentIndex) {
        this.jumpDirect(idx); // no animation on initial load
      }
    });
  }

  ngOnDestroy(): void {
    this.removeSwipeListeners();
    this.headerService.resetMinDistanceToShowHeader();
  }

  private initializeCardStates(): void {
    this.cards.forEach((card, index) => {
      if (index === 0) {
        card.status = 'visible';
        card.position = 'current';
      } else {
        card.status = 'hidden';
        card.position = 'after';
      }

      // Ensure type is set for all cards
      if (!card.type) {
        card.type = 'card';
      }
    });
  }

  private resetCardPosition(card: Card, isForward: boolean): void {
    if (isForward) {
      card.position = 'before';
    } else {
      card.position = 'after';
    }
  }

  private async transitionToCard(
    newIndex: number,
    clickedButton: ClickedButton | null
  ): Promise<void> {
    if (this.isTransitioning || newIndex === this.currentIndex) return;

    // Hide comments at start of transition
    this.showCommentsSection = false;

    let clickedBtnRef: ElementRef | null = null;
    if (clickedButton !== null) {
      if (clickedButton === 'prev') {
        clickedBtnRef = this.prevBtn;
      } else if (clickedButton === 'next') {
        clickedBtnRef = this.nextBtn;
      } else if (clickedButton === 'first') {
        clickedBtnRef = this.firstBtn;
      } else {
        clickedBtnRef = this.lastBtn;
      }

      if (clickedBtnRef && clickedBtnRef.nativeElement) {
        clickedBtnRef.nativeElement.classList.add('clicked');
      }
    }

    this.isTransitioning = true;
    this.previousIndex = this.currentIndex;
    this.nextIndex = newIndex;
    this.isGreaterJump =
      (this.previousIndex == 0 && this.nextIndex == this.cards.length - 1) ||
      (this.previousIndex == this.cards.length - 1 && this.nextIndex == 0);

    const currentCard = this.cards[this.currentIndex];
    const nextCard = this.cards[newIndex];

    // Determine direction
    const isForward = newIndex > this.currentIndex;

    // Reset card positions before transition
    this.resetCardPosition(currentCard, isForward);
    this.resetCardPosition(nextCard, isForward);

    // All transitions work the same way - slide animations
    currentCard.status = 'transitioning-out';
    nextCard.status = 'transitioning-in';

    if (isForward) {
      currentCard.position = 'before';
      nextCard.position = 'slide-in-from-right';
    } else {
      currentCard.position = 'after';
      nextCard.position = 'slide-in-from-left';
    }

    await wait(800);

    // Update states after transition
    if (clickedBtnRef && clickedBtnRef.nativeElement) {
      clickedBtnRef.nativeElement.classList.remove('clicked');
    }
    if (this.isMobile) {
      this.temporarilyDisableHover(clickedBtnRef);
    }
    currentCard.status = 'hidden';
    currentCard.position = isForward ? 'before' : 'after';

    nextCard.position = 'current';
    this.currentIndex = newIndex;
    this.isTransitioning = false;

    // Small 1 ms delay ensures the "transitioning-in" state is rendered in the DOM
    // before switching to "visible". Without this, Angular may apply both states
    // within the same frame when adding the next card, causing the browser to skip
    // the opacity transition entirely (especially for intro/outro ↔ card changes).
    // This guarantees the fade-in animation for text and comics will always trigger.

    await wait(1);
    nextCard.status = 'visible';

    // Show comments after animation
    this.showCommentsSection = true;

    this.updateUrlForCurrentCard();
  }

  /**
   * During a transition we render the “next” card;
   * otherwise we render the one at currentIndex.
   */
  get activeCard(): Card {
    return this.isTransitioning && this.cards[this.nextIndex]
      ? this.cards[this.nextIndex]
      : this.cards[this.currentIndex];
  }

  previousCard(): void {
    if (this.currentIndex > 0 && !this.isTransitioning) {
      this.transitionToCard(this.currentIndex - 1, 'prev');
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1 && !this.isTransitioning) {
      this.transitionToCard(this.currentIndex + 1, 'next');
    }
  }

  dismissSwipeOnboarding(): void {
    this.showSwipeOnboarding = false;
    localStorage.setItem('ourStorySwipeOnboardingShown', 'true');
  }

  onCommentAdded(comment: Comment): void {
    console.log('New comment added:', comment);
  }

  private jumpDirect(newIndex: number): void {
    if (newIndex < 0 || newIndex >= this.cards.length) return;

    // hide comments to avoid flicker during state flip
    this.showCommentsSection = false;

    // reset all cards around the new index
    this.cards.forEach((card, i) => {
      card.status = i === newIndex ? 'visible' : 'hidden';
      card.position =
        i < newIndex ? 'before' : i > newIndex ? 'after' : 'current';
    });

    this.currentIndex = newIndex;

    // Update imageUrl for the new current card
    this.imageUrl.set(this.cards[newIndex].image || '');

    // show comments again
    this.showCommentsSection = true;
  }

  private updateUrlForCurrentCard(): void {
    const currentId = this.cards[this.currentIndex]?.id;
    if (!currentId) return;

    this.imageUrl.set(this.cards[this.currentIndex].image || '');

    this.router.navigate([], {
      queryParams: { cardId: currentId },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  }

  goToCardId(cardId: string): void {
    const idx = this.cards.findIndex((c) => c.id === cardId);
    if (idx === -1 || this.isTransitioning || idx === this.currentIndex) return;
    this.transitionToCard(idx, null);
  }

  private clampIndex(zeroBased: number): number {
    const max = Math.max(0, this.cards.length - 1);
    return Math.min(Math.max(zeroBased, 0), max);
  }

  onJump(userValue: number | null): void {
    if (this.isTransitioning) return;
    if (userValue == null || Number.isNaN(userValue)) return;

    // user enters 1-based; convert to 0-based and clamp
    const target = this.clampIndex((userValue as number) - 1);
    if (target === this.currentIndex) return;

    // use your existing animated transition
    const clieckedButton: ClickedButton = target === 0 ? 'first' : 'last';
    this.transitionToCard(target, clieckedButton);
  }

  goToFirstCard(): void {
    if (!this.isTransitioning && this.currentIndex > 0) {
      this.onJump(1);
    }
  }

  goToLastCard(): void {
    if (!this.isTransitioning && this.currentIndex < this.cards.length - 1) {
      this.onJump(this.cards.length);
    }
  }

  private temporarilyDisableHover(elRef: ElementRef | null) {
    if (!elRef?.nativeElement) return;

    const element = elRef.nativeElement;
    const originalPointerEvents = element.style.pointerEvents;

    // Disable pointer events to clear hover
    element.style.pointerEvents = 'none';

    // Force reflow to ensure hover state is cleared
    void element.offsetWidth;

    // Restore pointer events after a very short delay
    setTimeout(() => {
      element.style.pointerEvents = originalPointerEvents || '';
    }, 100);
  }

  // ---------------- SWIPE HANDLING ----------------
  private addSwipeListeners() {
    if (this.swipeListenerAdded) return;
    const el = this.cardWrapper.nativeElement;

    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });

    this.swipeListenerAdded = true;
  }

  private removeSwipeListeners() {
    if (!this.swipeListenerAdded) return;
    const el = this.cardWrapper.nativeElement;

    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchend', this.onTouchEnd);

    this.swipeListenerAdded = false;
  }

  private onTouchStart = (event: TouchEvent) => {
    // Ignore multi-touch
    if (event.touches.length > 1) return;

    // Check if zoomed in
    if (window.visualViewport && window.visualViewport.scale > 1) {
      return; // Don't start swipe if zoomed
    }

    this.touchStartX = event.touches[0].screenX;
    this.touchStartY = event.touches[0].screenY;
  };

  private onTouchEnd = (event: TouchEvent) => {
    // Ignore multi-touch
    if (event.changedTouches.length > 1) return;

    // Again check zoom level
    if (window.visualViewport && window.visualViewport.scale > 1) {
      return; // Don't swipe if zoomed
    }

    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.handleSwipeGesture();
  };

  private handleSwipeGesture() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;

    // Ignore vertical swipes (scrolling)
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Left swipe
    if (deltaX < -this.swipeThreshold) {
      this.nextCard();
    }

    // Right swipe
    if (deltaX > this.swipeThreshold) {
      this.previousCard();
    }
  }

  // ---------------- IMAGE FOCUS ----------------
  openGallery(): void {
    this.imageFocus.show();
  }
}

type ClickedButton = 'first' | 'prev' | 'next' | 'last';
