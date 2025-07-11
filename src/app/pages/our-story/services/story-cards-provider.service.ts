import { Injectable } from '@angular/core';
import { ParallaxCardModel } from '../models/parallax-card';

@Injectable()
export class StoryCardsProviderService {
  private readonly cards: ParallaxCardModel[] = [
    {
      type: 'intro',
      title: 'our_story.intro.title',
      description: 'our_story.intro.description',
    },
    {
      type: 'card',
      title: 'our_story.cards[0].title',
      date: { year: 1986 },
      description: 'our_story.cards[0].description',
      image: '/images/our-story/our-story_19860401.jpg',
      comic: '/images/comics/comics-04.png',
      comicPositionX: 'right',
      comicPositionY: 'top',
    },
    {
      type: 'card',
      title: 'our_story.cards[1].title',
      date: { year: 1987 },
      description: 'our_story.cards[1].description',
      image: '/images/our-story/our-story_19870801.jpg',
    },
    {
      type: 'outro',
      title: 'our_story.outro.title',
      description: 'our_story.outro.description',
    },
  ];

  constructor() {}

  getCards(): ParallaxCardModel[] {
    return this.cards;
  }
  getCard(index: number): ParallaxCardModel | null {
    if (index < 0 || index >= this.cards.length) {
      return null;
    }
    return this.cards[index];
  }
}
