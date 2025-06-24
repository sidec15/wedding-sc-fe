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
      title: 'our_story.start.title',
      date: { year: 1989, month: 1, day: 1 },
      description: 'our_story.start.description',
      image: '/images/our-story/our-story-19890101.jpg',
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
