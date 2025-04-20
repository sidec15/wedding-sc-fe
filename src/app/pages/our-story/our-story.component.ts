import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxCardModel } from '../../models/parallax-card.models';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { TranslateModule } from '@ngx-translate/core';
import { VisibilityService } from '../../services/visibility.service';
import { StoryCardsProviderService } from '../../services/story-cards-provider.service';
import { ParallaxCardComponent } from './parallax-card/parallax-card.component';
import { GalleryMobileComponent } from './gallery-mobile/gallery-mobile.component';

@Component({
  selector: 'app-parallax-showcase',
  standalone: true,
  imports: [
    CommonModule,
    ParallaxCardComponent,
    RingScrollComponent,
    TranslateModule,
    GalleryMobileComponent,
  ],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
})
export class OurStoryComponent {
  cards: ParallaxCardModel[] = [];

  constructor(
    private visibilityService: VisibilityService,
    private storycardsProvider: StoryCardsProviderService
  ) {
    this.cards = this.storycardsProvider.getCards();
  }

  openGallery(index: number): void {
    const currentCard = this.storycardsProvider.getCard(index);
    if (currentCard?.type === 'card') {
      this.visibilityService.setRingScrollEnabled(false);
      this.visibilityService.setGalleryStatus({
        isOpen: true,
        currentIndex: index - 1,
      });
    }
  }

  closeGallery(): void {
    this.visibilityService.setRingScrollEnabled(true);
    this.visibilityService.setGalleryStatus({
      isOpen: false,
      currentIndex: 0,
    });
  }
}
