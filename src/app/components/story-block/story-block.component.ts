import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryBlock } from '../../models/story-block.model'; // Create this interface file
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-story-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-block.component.html',
  styleUrls: ['./story-block.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class StoryBlockComponent {
  @Input() story!: StoryBlock;
  @Input() visible = true;

  formatDate(): string {
    const { year, month, day } = this.story.date;
    const pad = (v?: number) => (v ? v.toString().padStart(2, '0') : '');
    const dateParts = [pad(day), pad(month), year].filter(Boolean);
    return dateParts.join('/');
  }
}
