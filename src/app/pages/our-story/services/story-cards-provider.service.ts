import { Injectable } from '@angular/core';
import { CardModel } from '../models/card';

@Injectable()
export class StoryCardsProviderService {
  private readonly cards: CardModel[] = [
    {
      type: 'intro',
      title: 'our_story.intro.title',
      description: 'our_story.intro.description',
    },
    {
      type: 'card',
      title: 'our_story.cards.0.title',
      description: 'our_story.cards.0.description',
      image: '/images/our-story/our-story_19860401.jpg',
      comic: '/images/comics/comics-04.png',
    },
    {
      type: 'card',
      title: 'our_story.cards.1.title',
      description: 'our_story.cards.1.description',
      image: '/images/our-story/our-story_19870801.jpg',
      comic: '/images/comics/comics-04.png',
    },
    {
      type: 'outro',
      title: 'our_story.outro.title',
      description: 'our_story.outro.description',
    },
  ];

  constructor() {}

  getCards(): CardModel[] {
    return this.cards;
  }
  getCard(index: number): CardModel | null {
    if (index < 0 || index >= this.cards.length) {
      return null;
    }
    return this.cards[index];
  }
}
