import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxCardComponent } from '../../components/parallax-card/parallax-card.component';
import { ParallaxCardModel } from '../../models/parallax-card.models';

@Component({
  selector: 'app-parallax-showcase',
  standalone: true,
  imports: [CommonModule, ParallaxCardComponent],
  templateUrl: './parallax-showcase.component.html',
  styleUrls: ['./parallax-showcase.component.scss']
})
export class ParallaxShowcaseComponent {
  cards: ParallaxCardModel[] = [
    {
      type: 'intro',
      title: 'La nostra storia',
      description: 'Un viaggio tra i ricordi più belli di Chiara & Simone. Dall’infanzia fino a oggi.'
    },
    {
      title: 'Dove tutto è iniziato',
      date: { year: 1989, month: 1, day: 1 },
      description: 'Ci siamo conosciuti per la prima volta al liceo...',
      image: '/images/our-story/our-story-19890101.jpg',
    },
    {
      title: 'Primo viaggio insieme',
      date: { year: 2008, month: 8, day: 2 },
      description: 'Quell’estate in Spagna è stata indimenticabile.',
      image: '/images/our-story/our-story-20080802.jpg',
    },
    {
      title: 'Ha detto sì!',
      date: { year: 2023, month: 12, day: 10 },
      description: 'Una proposta emozionante sotto le stelle.',
      image: '/images/our-story/our-story-20151023.jpg',
      textPosition: 'right'
    },
    {
      type: 'outro',
      title: 'To be continued...',
      description: 'Siamo solo all’inizio. Ci aspettano ancora mille avventure.'
    }
  ];
}
