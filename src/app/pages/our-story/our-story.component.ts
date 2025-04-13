import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxCardComponent } from '../../components/parallax-card/parallax-card.component';
import { ParallaxCardModel } from '../../models/parallax-card.models';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';

@Component({
  selector: 'app-parallax-showcase',
  standalone: true,
  imports: [CommonModule, ParallaxCardComponent, RingScrollComponent],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss']
})
export class OurStoryComponent {
  cards: ParallaxCardModel[] = [
    {
      type: 'intro',
      title: 'our_story.intro.title',
      description: 'our_story.intro.description'
    },
    {
      title: 'our_story.start.title',
      date: { year: 1989, month: 1, day: 1 },
      description: 'our_story.start.description',
      image: '/images/our-story/our-story-19890101.jpg',
    },
    {
      title: 'our_story.first_trip.title',
      date: { year: 2008, month: 8, day: 2 },
      description: 'our_story.first_trip.description',
      image: '/images/our-story/our-story-20080802.jpg',
    },
    {
      title: 'our_story.proposal.title',
      date: { year: 2023, month: 12, day: 10 },
      description: 'our_story.proposal.description',
      image: '/images/our-story/our-story-20151023.jpg',
      textPosition: 'right'
    },
    {
      type: 'outro',
      title: 'our_story.outro.title',
      description: 'our_story.outro.description'
    }
  ];
}
