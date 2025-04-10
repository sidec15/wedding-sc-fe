import { Component, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryBlock } from '../../models/story-block.model';
import { StoryBlockComponent } from '../../components/story-block/story-block.component';

@Component({
  selector: 'app-our-story',
  imports: [CommonModule, StoryBlockComponent],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
})
export class OurStoryComponent implements AfterViewInit {
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

  focusedStory: StoryBlock | null = null;

  @ViewChildren('storyBlock') storyBlockElements!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    console.log('StoryBlockElements:', this.storyBlockElements); // Debug log
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const story = this.storyBlocks[+entry.target.getAttribute('data-index')!];
          console.log('Observed entry:', entry); // Debug log
          if (entry.isIntersecting) {
            console.log('In focus:', story); // Debug log
            this.focusedStory = story;
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the block is visible
    );

    this.storyBlockElements.forEach((block, index) => {
      block.nativeElement.setAttribute('data-index', index.toString());
      observer.observe(block.nativeElement);
    });
  }
}
