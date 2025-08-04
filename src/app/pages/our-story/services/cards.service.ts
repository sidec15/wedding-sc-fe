import { Injectable } from '@angular/core';
import { Card } from '../models/card';

@Injectable()
export class CardsService {
  private readonly cards: Card[] = [
    {
      type: 'intro',
      title: 'our_story.intro.title',
      description: 'our_story.intro.description',
    },
    {
      type: 'card',
      title: 'our_story.cards.chiara_neonata.title',
      description: 'our_story.cards.chiara_neonata.description',
      image: '/images/our-story/our-story-chiara_neonata.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_neonata.png'],
    },
    {
      type: 'card',
      title: 'our_story.cards.chiara_piccola_famiglia.title',
      description: 'our_story.cards.chiara_piccola_famiglia.description',
      image: '/images/our-story/our-story-chiara_piccola_famiglia.jpg',
    },
    {
      type: 'card',
      title: 'our_story.cards.simone_piccolo_calcio.title',
      description: 'our_story.cards.simone_piccolo_calcio.description',
      image: '/images/our-story/our-story-simone_piccolo_calcio.png',
      comics: ['/images/our-story/our-story-comics-simone_piccolo_calcio.png'],
    },
    {
      type: 'card',
      title: 'our_story.cards.chiara_piccola_primavera.title',
      description: 'our_story.cards.chiara_piccola_primavera.description',
      image: '/images/our-story/our-story-chiara_piccola_primavera.jpg',
    },
    {
      type: 'card',
      title: 'our_story.cards.simone_venezia.title',
      description: 'our_story.cards.simone_venezia.description',
      image: '/images/our-story/our-story-simone_venezia.jpg',
      comics: ['/images/our-story/our-story-comics-simone_venezia.png'],
    },
    {
      type: 'card',
      title: 'our_story.cards.chiara_piccola_natale.title',
      description: 'our_story.cards.chiara_piccola_natale.description',
      image: '/images/our-story/our-story-chiara_piccola_natale.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_piccola_natale.png'],
    },
    {
      type: 'card',
      title: 'our_story.cards.chiara_piccola_nonni.title',
      description: 'our_story.cards.chiara_piccola_nonni.description',
      image: '/images/our-story/our-story-chiara_piccola_nonni.jpg',
    },
    {
      type: 'card',
      title: 'our_story.cards.simone_piccolo_leone.title',
      description: 'our_story.cards.simone_piccolo_leone.description',
      image: '/images/our-story/our-story-simone_piccolo_leone.jpg',
    },
    {
      type: 'card',
      title: 'our_story.cards.simone_asilo_premio.title',
      description: 'our_story.cards.simone_asilo_premio.description',
      image: '/images/our-story/our-story-simone_asilo_premio.jpg',
      comics: ['/images/our-story/our-story-comics-simone_asilo_premio.png'],
    },
    {
      type: 'card',
      title: 'our_story.cards.chiara_giovane_fratelli.title',
      description: 'our_story.cards.chiara_giovane_fratelli.description',
      image: '/images/our-story/our-story-chiara_giovane_fratelli.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_giovane_fratelli.png'],
    },
    {
      type: 'card',
      title: 'our_story.cards.chiara_simone_gmg.title',
      description: 'our_story.cards.chiara_simone_gmg.description',
      image: '/images/our-story/our-story-chiara_simone_gmg.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_simone_gmg.png'],
    },
    {
      type: 'outro',
      title: 'our_story.outro.title',
      description: 'our_story.outro.description',
    },
  ];

  constructor() {
    this.cards[0].status = 'visible';
    this.cards[0].position = 'current';

    for (let i = 1; i < this.cards.length -1; i++) {
      this.cards[i].status = 'hidden';
      this.cards[i].position = 'after';
      this.cards[i].textPosition = 'left';
    }

    this.cards[this.cards.length - 1].status = 'hidden';
    this.cards[this.cards.length - 1].position = 'after';
  }

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
