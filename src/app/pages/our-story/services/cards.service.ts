import { Injectable } from '@angular/core';
import { Card } from '../models/card';

@Injectable()
export class CardsService {
  private readonly cards: Card[] = [
    {
      type: 'intro',
      title: 'our_story.intro.title',
      description: 'our_story.intro.description',

      position: 'current',
      status: 'visible',
    },
    {
      type: 'card',
      title: 'our_story.cards.0.title',
      description: 'our_story.cards.0.description',
      image: '/images/our-story/our-story_19860401.jpg',
      comics: ['/images/comics/comics-04.png'],

      position: 'after',
      status: 'hidden',
      textPosition: 'left',

    },
    {
      type: 'card',
      title: 'our_story.cards.1.title',
      description: 'our_story.cards.1.description',
      image: '/images/our-story/our-story_19870801.jpg',
      comics: ['/images/comics/comics-04.png'],

      position: 'after',
      status: 'hidden',
      textPosition: 'left',
    },
    {
      type: 'outro',
      title: 'our_story.outro.title',
      description: 'our_story.outro.description',

      position: 'after',
      status: 'hidden',
    },
  ];

  constructor() {}

  getCards(): Card[] {
    return this.cards;
  }
  getCard(index: number): Card | null {
    if (index < 0 || index >= this.cards.length) {
      return null;
    }
    return this.cards[index];
  }


}
