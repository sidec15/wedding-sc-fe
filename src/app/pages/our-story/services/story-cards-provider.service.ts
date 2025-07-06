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
      title: 'Un sorriso che conquista',
      date: { year: 1986 },
      description: 'Sorriso furbo, occhioni grandi e regina del lettino.',
      image: '/images/our-story/our-story_19860401.jpg',
      comic: '/images/comics/comics-04.png',
      comicPositionX: 'right',
      comicPositionY: 'bottom',
    },
    {
      type: 'card',
      title: 'our_story.first_trip.title',
      date: { year: 1987 },
      description: 'our_story.first_trip.description',
      image: '/images/our-story/our-story_19870801.jpg',
    },
    {
      type: 'card',
      title: 'our_story.proposal.title',
      date: { year: 1988 },
      description: 'our_story.proposal.description',
      image: '/images/our-story/our-story_19880601.jpg',
      textPosition: 'right',
    },
    {
      type: 'card',
      title: 'our_story.first_trip.title',
      date: { year: 1989 },
      description: 'our_story.first_trip.description',
      image: '/images/our-story/our-story_19890101.jpg',
      textPosition: 'right',
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
