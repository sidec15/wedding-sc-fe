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
import {
  plainTextMaxLength,
  plainTextRequired,
} from '../../../../components/rich-text-editor/validators/validators';
import { EventService } from '../../../../services/event.service';
import { CommentsService } from './services/comments.service';
import { finalize } from 'rxjs';

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
  maxCommentLength = 1000;
  currentLen = 0;
  maxNicknameLength = 20;
  commentRegex = /^[a-zA-Z0-9\s]+$/;
  toastDurationMs = 5000;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private eventService: EventService,
    private commentsService: CommentsService
  ) {
    this.commentForm = this.fb.group({
      authorName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(this.maxNicknameLength),
          Validators.pattern(this.commentRegex),
        ],
      ],
      messageHtml: [
        '',
        [plainTextRequired(), plainTextMaxLength(this.maxCommentLength)],
      ],
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
    this.eventService.emitLoadingMask(true);

    const nickname = (this.commentForm.get('authorName')?.value || '').trim();
    const messageHtml = this.commentForm.get('messageHtml')?.value || '';

    this.commentsService
      .create(this.cardId, { nickname, message: messageHtml })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.eventService.emitLoadingMask(false);
        })
      )
      .subscribe({
        next: (created) => {
          this.comments.unshift(created);
          this.commentAdded.emit(created);

          this.commentForm.reset();
          this.currentLen = 0;

          this.eventService.emitFlash({
            type: 'success',
            i18nKey: 'our_story.comments.success_message',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
        },
        error: (err) => {
          console.error('Failed to create comment', err);

          this.eventService.emitFlash({
            type: 'error',
            i18nKey: 'our_story.comments.error_message',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
        },
      });
  }

  get messageCtrl() {
    return this.commentForm.get('messageHtml');
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
        return this.translate.instant(
          'rich_text_editor.errors.required_fields'
        );
      }
      if (fieldName === 'authorName') {
        if (field.errors['minlength']) {
          return this.translate.instant(
            'rich_text_editor.errors.invalid_nickname_min'
          );
        }
        if (field.errors['maxlength']) {
          return this.translate.instant(
            'rich_text_editor.errors.invalid_nickname_max'
          );
        }
        if (field.errors['pattern']) {
          return this.translate.instant(
            'rich_text_editor.errors.invalid_nickname_chars'
          );
        }
      }
      if (fieldName === 'messageHtml' && field.errors['maxPlainTextLen']) {
        return this.translate.instant(
          'rich_text_editor.errors.invalid_content'
        );
      }
    }
    return '';
  }

  trackByCommentId(index: number, comment: Comment): string | undefined {
    return comment.commentId;
  }
}
