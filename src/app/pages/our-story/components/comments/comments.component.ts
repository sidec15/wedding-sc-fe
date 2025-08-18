import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Comment } from './models/comment';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss'
})
export class CommentsComponent {
  @Input() cardId: string = '';
  @Output() commentAdded = new EventEmitter<Comment>();

  comments: Comment[] = [];
  commentForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.commentForm = this.fb.group({
      authorName: ['', [Validators.required, Validators.minLength(2)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Mock data for testing
    this.loadMockComments();
  }

  private loadMockComments(): void {
    this.comments = [
      {
        commentId: '1',
        authorName: 'Maria',
        content: 'Che bella foto! 🥰',
        createdAt: DateTime.fromJSDate(new Date('2024-01-15T10:30:00'))
      },
      {
        commentId: '2',
        authorName: 'Giovanni',
        content: 'Ricordo perfetto di quel giorno! 😊',
        createdAt: DateTime.fromJSDate(new Date('2024-01-16T14:20:00'))
      },
      {
        commentId: '3',
        authorName: 'Anna',
        content: 'Momenti indimenticabili 💕',
        createdAt: DateTime.fromJSDate(new Date('2024-01-17T09:15:00'))
      }
    ];
  }

  onSubmit(): void {
    if (this.commentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const newComment: Comment = {
        commentId: Date.now().toString(),
        authorName: this.commentForm.get('authorName')?.value,
        content: this.commentForm.get('message')?.value,
        createdAt: DateTime.fromJSDate(new Date())
      };

      // Add to local array (in real app, this would be an API call)
      this.comments.unshift(newComment);

      // Emit the new comment
      this.commentAdded.emit(newComment);

      // Reset form
      this.commentForm.reset();
      this.isSubmitting = false;
    }
  }

  formatDate(date: DateTime): string {
    return date
      .setZone('Europe/Rome')
      .setLocale('it')
      .toLocaleString(DateTime.DATETIME_MED);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.commentForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Campo obbligatorio';
      }
      if (field.errors['minlength']) {
        return fieldName === 'authorName' ? 'Nickname troppo corto' : 'Messaggio troppo corto';
      }
    }
    return '';
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.commentId;
  }
}
