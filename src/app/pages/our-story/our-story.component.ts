import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxCardComponent } from '../../components/parallax-card/parallax-card.component';
import { ParallaxCardModel } from '../../models/parallax-card.models';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { TranslateModule } from '@ngx-translate/core';
import { GalleryMobileComponent } from '../../components/gallery-mobile/gallery-mobile.component';
import { VisibilityService } from '../../services/visibility.service';
import { StoryCardsProviderService } from '../../services/story-cards-provider.service';

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
    this.visibilityService.setRingScrollEnabled(false);
    this.visibilityService.setGalleryStatus({
      isOpen: true,
      currentIndex: index,
    });
  }

  closeGallery(): void {
    this.visibilityService.setRingScrollEnabled(true);
    this.visibilityService.setGalleryStatus({
      isOpen: false,
      currentIndex: 0,
    });
  }
}
