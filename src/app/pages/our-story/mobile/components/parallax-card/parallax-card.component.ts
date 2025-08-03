import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  HostListener,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../../services/platform.service';
import { Subscription, throttleTime } from 'rxjs';
import {
  EventService,
  ScrollEvent,
} from '../../../../../services/event.service';
import { CommentsComponent } from '../../../components/comments/comments.component';
import { Comment } from '../../../components/comments/models/comment';

@Component({
  selector: 'app-parallax-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, CommentsComponent],
  templateUrl: './parallax-card.component.html',
  styleUrls: ['./parallax-card.component.scss'],
})
export class ParallaxCardComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() description = '';
  @Input() image = '';
  @Input() textPosition: 'left' | 'right' = 'left';
  @Input() comics?: string[];
  @Input() type: 'card' | 'intro' | 'outro' = 'card';
  @Input() showComments: boolean = false;

  @ViewChild('card', { static: false }) cardEl?: ElementRef<HTMLElement>;
  @ViewChild('content', { static: false }) contentEl?: ElementRef<HTMLElement>;
  @ViewChild('comicsSection', { static: false })
  comicsSectionEl?: ElementRef<HTMLElement>;

  private scrollSub!: Subscription;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16))
      .subscribe((e) => {
        this.updateParallax();
        this.observeComics(e);
      });
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateParallax();
  }

  updateParallax(): void {
    if (!this.platformService.isBrowser()) return;
    const isMobile = window.innerWidth <= 768;

    const card = this.cardEl?.nativeElement as HTMLElement;
    const content = this.contentEl?.nativeElement as HTMLElement;

    if (!card || typeof card.getBoundingClientRect !== 'function') return;

    const img = card.querySelector('img') as HTMLElement;

    const cardRect = card.getBoundingClientRect();
    const imgRect = img?.getBoundingClientRect();
    const contentRect = content?.getBoundingClientRect();
    const scrollAmount = cardRect.top * 0.15;

    if (img && this.type === 'card') {
      const shouldAnimate =
        !isMobile || scrollAmount > 0 || imgRect.bottom > contentRect.top;
      if (shouldAnimate) {
        img.style.transform = `translateY(${scrollAmount}px)`;
      }
    }

    const isVisible = cardRect.top < window.innerHeight * 0.8;
    if (isVisible && content) {
      content.classList.add('visible');
    } else if (this.type === 'intro' || this.type === 'outro') {
      // Intro and outro cards should always be visible
      content.classList.add('visible');
    } else {
      content.classList.remove('visible'); // Needed for fade-out
    }
  }

  private observeComics(e: ScrollEvent): void {
    const comicsSectionEl = this.comicsSectionEl?.nativeElement;
    if (!comicsSectionEl) return;

    const position = this.platformService.positionYInViewport(comicsSectionEl);

    const el = comicsSectionEl;

    if (position === 'visible' && !el.classList.contains('visible')) {
      el.classList.add('visible');
    } else if (position === 'below' && el.classList.contains('visible')) {
      el.classList.remove('visible');
    }
  }

  onCommentAdded(comment: Comment): void {
    console.log('New comment added:', comment);
    // Here you can implement API call to save the comment
  }
}
