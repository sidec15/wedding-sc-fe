import { Injectable } from '@angular/core';
import { CardModel } from '../models/card';

@Injectable()
export class StoryCardsProviderDesktopService {
  private readonly cards: CardModel[] = [
    {
      type: 'intro',
      title: 'our_story.intro.title',
      description: 'our_story.intro.description',
      status: 'visible',
    },
    {
      type: 'card',
      title: 'our_story.cards.0.title',
      description: 'our_story.cards.0.description',
      image: '/images/our-story/our-story_19860401.jpg',
      comic: '/images/comics/comics-04.png',
      status: 'hidden',
      position: 'after',
    },
    {
      type: 'card',
      title: 'our_story.cards.1.title',
      description: 'our_story.cards.1.description',
      image: '/images/our-story/our-story_19870801.jpg',
      comic: '/images/comics/comics-04.png',
      status: 'hidden',
      position: 'after',
    },
    {
      type: 'outro',
      title: 'our_story.outro.title',
      description: 'our_story.outro.description',
      status: 'hidden',
      position: 'after',
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
