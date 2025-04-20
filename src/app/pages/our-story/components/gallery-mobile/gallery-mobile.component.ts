import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { StoryCardsProviderService } from '../../services/story-cards-provider.service';
import { ParallaxCardModel } from '../../models/parallax-card.models';
import { OurStoryVisibilityService } from '../../services/our-story-visibility.service';
import { PlatformService } from '../../../../services/platform.service';
import { NgIf } from '@angular/common';

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
    private platformService: PlatformService,
    private ourStoryVisibilityService: OurStoryVisibilityService,
    private storyCardsProviderService: StoryCardsProviderService,
    private checngeDetector: ChangeDetectorRef,
  ) {
    this.cards = this.storyCardsProviderService.getCards()
    .filter((card) => card.type === 'card');
  }

  ngOnInit(): void {
    if (!this.platformService.isBrowser()) return;
    this.subscription = this.ourStoryVisibilityService.galleryStatus$.subscribe(
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
    if (!this.platformService.isBrowser()) return;
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
    if(!this.platformService.isBrowser()) return;
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    if(!this.platformService.isBrowser()) return;
    document.body.style.overflow = '';
  }
}
