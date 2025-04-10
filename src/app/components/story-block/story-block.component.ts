import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { StoryBlock } from '../../models/story-block.model'; // adjust path if needed

@Component({
  selector: 'app-story-block',
  imports: [CommonModule],
  templateUrl: './story-block.component.html',
  styleUrl: './story-block.component.scss',
  animations: [
    trigger('fadeInSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ]
})
export class StoryBlockComponent {
  @Input() story!: StoryBlock;
  @Input() visible: boolean = false;

  formatDate(): string {
    const { year, month, day } = this.story.date;
    const pad = (v?: number) => (v ? v.toString().padStart(2, '0') : '');
    const dateParts = [pad(day), pad(month), year].filter(Boolean);
    return dateParts.join('/');
  }
}
