import { Component, AfterViewInit, ElementRef, QueryList, ViewChildren, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryBlock } from '../../models/story-block.model';

@Component({
  selector: 'app-our-story',
  imports: [CommonModule],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
})
export class OurStoryComponent {
  storyBlocks: StoryBlock[] = [
    {
      title: 'Dove tutto è iniziato',
      date: { year: 2005 },
      description: 'Ci siamo conosciuti per la prima volta al liceo...',
      image: '/images/our-story/our-story-19890101.jpg',
    },
    {
      title: 'Primo viaggio insieme',
      date: { year: 2009, month: 7 },
      description: 'Quell’estate in Spagna è stata indimenticabile.',
      image: '/images/our-story/our-story-20080802.jpg',
    },
    {
      title: 'Ha detto sì!',
      date: { year: 2023, month: 12, day: 10 },
      description: 'Una proposta emozionante sotto le stelle.',
      image: '/images/our-story/our-story-20151023.jpg',
    },
  ];


  scrollPercent = 0;
  circumference = 2 * Math.PI * 26; // r = 26 (radius of the SVG circle)
  
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    ) - window.innerHeight;

    this.scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
  }
  
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  

}
