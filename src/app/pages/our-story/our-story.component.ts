import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxCardModel } from './models/parallax-card';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { TranslateModule } from '@ngx-translate/core';
import { StoryCardsProviderService } from './services/story-cards-provider.service';
import { ParallaxCardComponent } from './components/parallax-card/parallax-card.component';
import { OurStoryVisibilityService } from './services/our-story-visibility.service';
import { GalleryComponent } from './components/gallery/gallery.component';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-parallax-showcase',
  standalone: true,
  imports: [
    CommonModule,
    ParallaxCardComponent,
    RingScrollComponent,
    TranslateModule,
    GalleryComponent
  ],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
  providers: [OurStoryVisibilityService, StoryCardsProviderService]
})
export class OurStoryComponent {
  cards: ParallaxCardModel[] = [];

  constructor(
    private eventService: EventService,
    private ourStoryVisibilityService: OurStoryVisibilityService,
    private storycardsProvider: StoryCardsProviderService
  ) {
    this.cards = this.storycardsProvider.getCards();
  }

  openGallery(index: number): void {
    const currentCard = this.storycardsProvider.getCard(index);
    if (currentCard?.type === 'card') {
      this.eventService.emitRingScrollEnabled(false);
      this.ourStoryVisibilityService.emitGalleryStatus({
        isOpen: true,
        currentIndex: index - 1,
      });
    }
  }

  closeGallery(): void {
    this.eventService.emitRingScrollEnabled(true);
    this.ourStoryVisibilityService.emitGalleryStatus({
      isOpen: false,
      currentIndex: 0,
    });
  }
}
