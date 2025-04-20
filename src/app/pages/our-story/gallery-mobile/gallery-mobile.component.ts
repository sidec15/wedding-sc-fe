import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { ParallaxCardModel } from '../../../models/parallax-card.models';
import { VisibilityService } from '../../../services/visibility.service';
import { StoryCardsProviderService } from '../../../services/story-cards-provider.service';

@Component({
  selector: 'app-gallery-mobile',
  imports: [TranslateModule, NgIf],
  templateUrl: './gallery-mobile.component.html',
  styleUrl: './gallery-mobile.component.scss',
})
export class GalleryMobileComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;

  cards: ParallaxCardModel[] = [];
  currentCardIndex: number = 0;
  currentCard: ParallaxCardModel = {} as ParallaxCardModel;
  isGalleryOpen: boolean = false;

  constructor(
    private visibilityService: VisibilityService,
    private storyCardsProviderService: StoryCardsProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private checngeDetector: ChangeDetectorRef
  ) {
    this.cards = this.storyCardsProviderService.getCards()
    .filter((card) => card.type === 'card');
  }

  ngOnInit(): void {
    this.subscription = this.visibilityService.galleryStatus$.subscribe(
      (status) => {
        if (status.isOpen) {
          this.openGallery(status.currentIndex);
        } else {
          this.closeGallery();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.unlockScroll();
  }

  openGallery(index: number): void {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && this.cards.length > 0) {
      this.currentCardIndex = index;
      this.currentCard = this.cards[index];
      this.isGalleryOpen = true;
      this.lockScroll();
      this.checngeDetector.detectChanges(); // Ensure the view is updated
    }
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.unlockScroll();
  }

  prevCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.currentCard = this.cards[this.currentCardIndex];
      this.checngeDetector.detectChanges(); // Ensure the view is updated
    }
  }

  nextCard(): void {
    if (this.currentCardIndex < this.cards.length - 1) {
      this.currentCardIndex++;
      this.currentCard = this.cards[this.currentCardIndex];
      this.checngeDetector.detectChanges(); // Ensure the view is updated
    }
  }

  private lockScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  private unlockScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}
