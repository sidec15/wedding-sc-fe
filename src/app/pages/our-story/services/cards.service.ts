import { Injectable } from '@angular/core';
import { Card } from '../models/card';

@Injectable()
export class CardsService {
  private readonly cards: Card[] = [
    {
      id: "intro",
      type: 'intro',
      title: 'our_story.intro.title',
      description: 'our_story.intro.description',
    },
    {
      id: 'chiara_neonata',
      type: 'card',
      title: 'our_story.cards.chiara_neonata.title',
      description: 'our_story.cards.chiara_neonata.description',
      image: '/images/our-story/our-story-chiara_neonata.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_neonata.png'],
    },
    {
      id: 'chiara_piccola_famiglia',
      type: 'card',
      title: 'our_story.cards.chiara_piccola_famiglia.title',
      description: 'our_story.cards.chiara_piccola_famiglia.description',
      image: '/images/our-story/our-story-chiara_piccola_famiglia.jpg',
    },
    {
      id: 'simone_piccolo_calcio',
      type: 'card',
      title: 'our_story.cards.simone_piccolo_calcio.title',
      description: 'our_story.cards.simone_piccolo_calcio.description',
      image: '/images/our-story/our-story-simone_piccolo_calcio.png',
      comics: ['/images/our-story/our-story-comics-simone_piccolo_calcio.png'],
    },
    {
      id: 'chiara_piccola_primavera',
      type: 'card',
      title: 'our_story.cards.chiara_piccola_primavera.title',
      description: 'our_story.cards.chiara_piccola_primavera.description',
      image: '/images/our-story/our-story-chiara_piccola_primavera.jpg',
    },
    {
      id: 'simone_piccolo_papa',
      type: 'card',
      title: 'our_story.cards.simone_piccolo_papa.title',
      description: 'our_story.cards.simone_piccolo_papa.description',
      image: '/images/our-story/our-story-simone_piccolo_papa.jpg',
      comics: ['/images/our-story/our-story-comics-simone_piccolo_papa.png'],
    },
    {
      id: 'simone_venezia',
      type: 'card',
      title: 'our_story.cards.simone_venezia.title',
      description: 'our_story.cards.simone_venezia.description',
      image: '/images/our-story/our-story-simone_venezia.jpg',
      comics: ['/images/our-story/our-story-comics-simone_venezia.png'],
    },
    {
      id: 'chiara_piccola_natale',
      type: 'card',
      title: 'our_story.cards.chiara_piccola_natale.title',
      description: 'our_story.cards.chiara_piccola_natale.description',
      image: '/images/our-story/our-story-chiara_piccola_natale.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_piccola_natale.png'],
    },
    {
      id: 'simone_nonni',
      type: 'card',
      title: 'our_story.cards.simone_nonni.title',
      description: 'our_story.cards.simone_nonni.description',
      image: '/images/our-story/our-story-simone_nonni.png',
    },
    {
      id: 'chiara_piccola_nonni',
      type: 'card',
      title: 'our_story.cards.chiara_piccola_nonni.title',
      description: 'our_story.cards.chiara_piccola_nonni.description',
      image: '/images/our-story/our-story-chiara_piccola_nonni.jpg',
    },
    {
      id: 'simone_piccolo_leone',
      type: 'card',
      title: 'our_story.cards.simone_piccolo_leone.title',
      description: 'our_story.cards.simone_piccolo_leone.description',
      image: '/images/our-story/our-story-simone_piccolo_leone.jpg',
    },
    {
      id: 'chiara_bruno',
      type: 'card',
      title: 'our_story.cards.chiara_bruno.title',
      description: 'our_story.cards.chiara_bruno.description',
      image: '/images/our-story/our-story-chiara_bruno.png',
    },
    {
      id: 'simone_piccolo_fratelli',
      type: 'card',
      title: 'our_story.cards.simone_piccolo_fratelli.title',
      description: 'our_story.cards.simone_piccolo_fratelli.description',
      image: '/images/our-story/our-story-simone_piccolo_fratelli.jpg',
      comics: ['/images/our-story/our-story-comics-simone_piccolo_fratelli.png'],
    },
    {
      id: 'simone_asilo_premio',
      type: 'card',
      title: 'our_story.cards.simone_asilo_premio.title',
      description: 'our_story.cards.simone_asilo_premio.description',
      image: '/images/our-story/our-story-simone_asilo_premio.jpg',
      comics: ['/images/our-story/our-story-comics-simone_asilo_premio.png'],
    },
    {
      id: 'chiara_giovane_fratelli',
      type: 'card',
      title: 'our_story.cards.chiara_giovane_fratelli.title',
      description: 'our_story.cards.chiara_giovane_fratelli.description',
      image: '/images/our-story/our-story-chiara_giovane_fratelli.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_giovane_fratelli.png'],
    },
    {
      id: 'simone_cugini',
      type: 'card',
      title: 'our_story.cards.simone_cugini.title',
      description: 'our_story.cards.simone_cugini.description',
      image: '/images/our-story/our-story-simone_cugini.png',
    },
    {
      id: 'chiara_simone_gmg',
      type: 'card',
      title: 'our_story.cards.chiara_simone_gmg.title',
      description: 'our_story.cards.chiara_simone_gmg.description',
      image: '/images/our-story/our-story-chiara_simone_gmg.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_simone_gmg.png'],
    },
    {
      id: 'simone_fratelli_tutti',
      type: 'card',
      title: 'our_story.cards.simone_fratelli_tutti.title',
      description: 'our_story.cards.simone_fratelli_tutti.description',
      image: '/images/our-story/our-story-simone_fratelli_tutti.jpg',
    },
    {
      id: 'chiara_simone_marco_giulia',
      type: 'card',
      title: 'our_story.cards.chiara_simone_marco_giulia.title',
      description: 'our_story.cards.chiara_simone_marco_giulia.description',
      image: '/images/our-story/our-story-chiara_simone_marco_giulia.png',
    },
    {
      id: 'chiara_simone_laurea',
      type: 'card',
      title: 'our_story.cards.chiara_simone_laurea.title',
      description: 'our_story.cards.chiara_simone_laurea.description',
      image: '/images/our-story/our-story-chiara_simone_laurea.png',
      comics: ['/images/our-story/our-story-comics-chiara_simone_laurea.png'],
    },
    {
      id: 'chiara_simone_brace',
      type: 'card',
      title: 'our_story.cards.chiara_simone_brace.title',
      description: 'our_story.cards.chiara_simone_brace.description',
      image: '/images/our-story/our-story-chiara_simone_brace.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_simone_brace.png'],
    },
    {
      id: 'chiara_simone_argentario',
      type: 'card',
      title: 'our_story.cards.chiara_simone_argentario.title',
      description: 'our_story.cards.chiara_simone_argentario.description',
      image: '/images/our-story/our-story-chiara_simone_argentario.jpg',
    },
    {
      id: 'chiara_simone_mare_mosso',
      type: 'card',
      title: 'our_story.cards.chiara_simone_mare_mosso.title',
      description: 'our_story.cards.chiara_simone_mare_mosso.description',
      image: '/images/our-story/our-story-chiara_simone_mare_mosso.jpg',
      comics: ['/images/our-story/our-story-comics-chiara_simone_mare_mosso.png'],
    },
    {
      id: "outro",
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

  getCardByIndex(index: number): Card | null {
    if (index < 0 || index >= this.cards.length) {
      return null;
    }
    return this.cards[index];
  }


}
