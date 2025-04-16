import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ParallaxCardModel } from '../../models/parallax-card.models';
import { VisibilityService } from '../../services/visibility.service';
import { StoryCardsProviderService } from '../../services/story-cards-provider.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { isPlatformBrowser, NgIf } from '@angular/common';

@Component({
  selector: 'app-gallery-mobile',
  imports: [TranslateModule, NgIf],
  templateUrl: './gallery-mobile.component.html',
  styleUrl: './gallery-mobile.component.scss',
})
export class GalleryMobileComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;

  cards: ParallaxCardModel[] = [];
  currentIndex: number = 0;
  currentCard: ParallaxCardModel = {} as ParallaxCardModel;
  isGalleryOpen: boolean = false;

  constructor(
    private visibilityService: VisibilityService,
    private storyCardsProviderService: StoryCardsProviderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cards = this.storyCardsProviderService.getCards();
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
    if (isMobile) {
      this.currentIndex = index;
      this.currentCard = this.cards[index];
      this.isGalleryOpen = true;
      this.lockScroll();
    }
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.unlockScroll();
  }

  prevCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentCard = this.cards[this.currentIndex];
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.currentCard = this.cards[this.currentIndex];
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
