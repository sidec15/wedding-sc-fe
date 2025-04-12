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
      title: 'Dove tutto è iniziato',
      description: 'Ci siamo conosciuti per la prima volta al liceo...',
      image: '/images/our-story/our-story-19890101.jpg',
    },
    {
      title: 'Primo viaggio insieme',
      date: { year: 1989 },
      description: 'Quell’estate in Spagna è stata indimenticabile.',
      image: '/images/our-story/our-story-20080802.jpg',
    },
    {
      title: 'Ha detto sì!',
      description: 'Una proposta emozionante sotto le stelle.',
      image: '/images/our-story/our-story-20151023.jpg',
    }
  ];
}
