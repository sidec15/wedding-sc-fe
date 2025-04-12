import { Component, AfterViewInit, ElementRef, QueryList, ViewChildren, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryBlock } from '../../models/story-block.model';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-our-story',
  imports: [CommonModule],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(50px)',
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)',
      })),
      transition('hidden => visible', [
        animate('1200ms ease-out') // Slower entrance
      ]),
      transition('visible => hidden', [
        animate('800ms ease-in') // Disappears smoothly
      ])
    ])
  ]
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
  visibleIndexes = new Set<number>();

  @ViewChildren('storyBlock', { read: ElementRef }) storyBlockElements!: QueryList<ElementRef>;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const windowHeight = window.innerHeight;
  
    this.storyBlockElements.forEach((el, index) => {
      const rect = el.nativeElement.getBoundingClientRect();
      const isVisible = rect.top < windowHeight * 0.75 && rect.bottom > 0;
  
      if (isVisible) {
        this.visibleIndexes.add(index);
      } else {
        this.visibleIndexes.delete(index); // 👈 Remove when not visible
      }
    });
  
    // Scroll percentage ring
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
  
  isVisible(index: number): boolean {
    return this.visibleIndexes.has(index);
  }

}
