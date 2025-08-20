import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { Comment } from './models/comment';
import { RichTextEditorComponent } from '../../../../components/rich-text-editor/rich-text-editor.component';
import { SafeHtmlPipe } from '../../../../pipes/safe-html.pipe';

// ⬇️ import the reusable editor + safe HTML pipe

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RichTextEditorComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent {
  @Input() cardId: string = '';
  @Output() commentAdded = new EventEmitter<Comment>();

  comments: Comment[] = [];
  commentForm: FormGroup;
  isSubmitting = false;
  maxMessageLength = 2000; // editor uses this as plain-text max
  currentLen = 0; // for live counter from (lengthChange)

  constructor(private fb: FormBuilder, private translate: TranslateService) {
    this.commentForm = this.fb.group({
      authorName: ['', [Validators.required, Validators.minLength(2)]],
      // holds HTML string from the editor
      messageHtml: ['', [Validators.required]],
    });

    this.loadMockComments();
  }

  private loadMockComments(): void {
    this.comments = [
      {
        commentId: '1',
        authorName: 'Maria',
        content: '<p>Che bella foto! 🥰</p>',
        createdAt: DateTime.fromJSDate(new Date('2024-01-15T10:30:00')),
      },
      {
        commentId: '2',
        authorName: 'Giovanni',
        content: '<p>Ricordo perfetto di quel giorno! 😊</p>',
        createdAt: DateTime.fromJSDate(new Date('2024-01-16T14:20:00')),
      },
      {
        commentId: '3',
        authorName: 'Anna',
        content: '<p>Momenti indimenticabili <strong>💕</strong></p>',
        createdAt: DateTime.fromJSDate(new Date('2024-01-17T09:15:00')),
      },
    ];
  }

  onSubmit(): void {
    if (this.commentForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    const newComment: Comment = {
      commentId: Date.now().toString(),
      authorName: this.commentForm.get('authorName')?.value,
      content: this.commentForm.get('messageHtml')?.value, // HTML from editor
      createdAt: DateTime.fromJSDate(new Date()),
    };

    // Add locally (replace with API call in real app)
    this.comments.unshift(newComment);
    this.commentAdded.emit(newComment);

    this.commentForm.reset();
    this.currentLen = 0;
    this.isSubmitting = false;
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
        return this.translate.instant('rich_text_editor.errors.required_fields');
      }
      if (field.errors['minlength']) {
        return this.translate.instant('rich_text_editor.errors.invalid_nickname');
      }
      if (field.errors['maxPlainTextLen']) {
        return this.translate.instant('rich_text_editor.errors.invalid_content');
      }
    }
    return '';
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.commentId;
  }
}
