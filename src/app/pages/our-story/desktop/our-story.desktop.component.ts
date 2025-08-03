import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../services/platform.service';
import { HeaderService } from '../../../services/header.service';
import { CardsService } from '../services/cards.service';
import { Card } from '../models/card';
import { CommentsComponent } from '../components/comments/comments.component';
import { Comment } from '../components/comments/models/comment';

@Component({
  selector: 'app-our-story-desktop',
  standalone: true,
  imports: [TranslateModule, NgClass, NgTemplateOutlet, CommentsComponent],
  templateUrl: './our-story.desktop.component.html',
  styleUrls: ['./our-story.desktop.component.scss'],
  providers: [CardsService],
})
export class OurStoryDesktopComponent implements AfterViewInit, OnDestroy {

  @ViewChild('prevBtn', { static: false })
  prevBtn!: ElementRef;
  @ViewChild('nextBtn', { static: false })
  nextBtn!: ElementRef;

  cards: Card[] = [];
  currentIndex: number = 0;
  isTransitioning: boolean = false;
  previousIndex: number = 0;
  nextIndex: number = 0;
  isMobile: boolean = false;

  constructor(
    private platformService: PlatformService,
    private storycardsProvider: CardsService,
    private headerService: HeaderService
  ) {
    this.cards = this.storycardsProvider.getCards();
    // Initialize all cards with proper states
    this.initializeCardStates();
  }

  ngAfterViewInit(): void {
    this.isMobile = this.platformService.isMobile();
    this.headerService.setMinDistanceToShowHeader(1);
    // Focus the component for keyboard navigation
    if (this.isMobile) {
      if (typeof window !== 'undefined') {
        const element = document.querySelector('.story-gallery');
        if (element) {
          (element as HTMLElement).focus();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.headerService.resetMinDistanceToShowHeader();
  }

  private initializeCardStates(): void {
    this.cards.forEach((card, index) => {
      if (index === 0) {
        card.status = 'visible';
        card.position = 'current';
      } else {
        card.status = 'hidden';
        card.position = 'after';
      }

      // Ensure type is set for all cards
      if (!card.type) {
        card.type = 'card';
      }
    });
  }

  private resetCardPosition(card: Card, isForward: boolean): void {
    if (isForward) {
      card.position = 'before';
    } else {
      card.position = 'after';
    }
  }

  private async transitionToCard(
    newIndex: number,
    clickedButton: 'prev' | 'next' | null
  ): Promise<void> {
    if (this.isTransitioning || newIndex === this.currentIndex) return;

    let clickedBtnRef: ElementRef | null = null;
    if (clickedButton !== null) {
      if (clickedButton === 'prev') {
        clickedBtnRef = this.prevBtn;
      } else {
        clickedBtnRef = this.nextBtn;
      }
      if (clickedBtnRef && clickedBtnRef.nativeElement) {
        clickedBtnRef.nativeElement.classList.add('clicked');
      }
    }

    this.isTransitioning = true;
    this.previousIndex = this.currentIndex;
    this.nextIndex = newIndex;

    const currentCard = this.cards[this.currentIndex];
    const nextCard = this.cards[newIndex];

    // Determine direction
    const isForward = newIndex > this.currentIndex;

    // Reset card positions before transition
    this.resetCardPosition(currentCard, isForward);
    this.resetCardPosition(nextCard, isForward);

    // All transitions work the same way - slide animations
    currentCard.status = 'transitioning-out';
    nextCard.status = 'transitioning-in';

    if (isForward) {
      currentCard.position = 'before';
      nextCard.position = 'slide-in-from-right';
    } else {
      currentCard.position = 'after';
      nextCard.position = 'slide-in-from-left';
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update states after transition
    if (clickedBtnRef && clickedBtnRef.nativeElement) {
      clickedBtnRef.nativeElement.classList.remove('clicked');
      console.log('Removed clicked class from button');
    }
    currentCard.status = 'hidden';
    currentCard.position = isForward ? 'before' : 'after';
    nextCard.status = 'visible';
    nextCard.position = 'current';
    this.currentIndex = newIndex;
    this.isTransitioning = false;
  }

  previousCard(): void {
    if (this.currentIndex > 0 && !this.isTransitioning) {
      this.transitionToCard(this.currentIndex - 1, 'prev');
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1 && !this.isTransitioning) {
      this.transitionToCard(this.currentIndex + 1, 'next');
    }
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousCard();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextCard();
        break;
      case 'Home':
        event.preventDefault();
        if (this.currentIndex !== 0) {
          this.transitionToCard(0, null);
        }
        break;
      case 'End':
        event.preventDefault();
        if (this.currentIndex !== this.cards.length - 1) {
          this.transitionToCard(this.cards.length - 1, null);
        }
        break;
    }
  }

  onCommentAdded(comment: Comment): void {
    console.log('New comment added:', comment);
    // Here you can implement API call to save the comment
  }
}
