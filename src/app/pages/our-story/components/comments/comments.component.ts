import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
import { SubscriptionsService } from './services/subscriptions.service';
import { SecurityConsentComponent } from '../../../../components/security-consent/security-consent.component';

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
    SecurityConsentComponent,
  ],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnChanges {
  @Input() cardId: string = '';
  @Output() commentAdded = new EventEmitter<Comment>();

  // List + pagination state
  comments: Comment[] = [];
  pageSize = 2;
  cursor: string | null = null;
  hasNext = false;
  totalCount: number | null = null;

  // Loading flags
  isInitialLoading = false;
  isLoadingMore = false;

  // Subscriptions UI
  isSubscribing = false;
  isUnsubscribing = false;
  showSubscribeBox = false;
  isSubscribed = false; // local UI state (server can keep it idempotent)

  // Forms
  commentForm: FormGroup;
  subscriptionForm: FormGroup;

  // Other UI
  isSubmitting = false;
  maxCommentLength = 1000;
  currentLen = 0;
  maxNicknameLength = 20;
  commentRegex = /^[a-zA-Z0-9' -]+$/;
  toastDurationMs = 5000;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private eventService: EventService,
    private commentsService: CommentsService,
    private subscriptionsService: SubscriptionsService
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
      privacyConsent: [false, Validators.requiredTrue],
      captcha: ['', Validators.required], // Captcha field
      website: [''], // Honeypot field
    });

    this.subscriptionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      privacyConsentSubscription: [false, Validators.requiredTrue],
      captchaSubscription: ['', Validators.required], // Captcha field
      websiteSubscription: [''], // Honeypot field
    });
  }

  // Reload when photo/card changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardId'] && this.cardId) {
      this.resetAndLoad();
    }
  }

  get subEmailCtrl() {
    return this.subscriptionForm.get('email');
  }

  /** Reset pagination and load first page */
  private resetAndLoad(): void {
    this.comments = [];
    this.cursor = null;
    this.hasNext = false;
    this.totalCount = null;
    this.loadComments(true);
  }

  /** Load comments (first page when initial=true, otherwise append next page) */
  loadComments(initial = false): void {
    if (!this.cardId) return;

    if (initial) {
      this.isInitialLoading = true;
    } else {
      if (this.isLoadingMore) return; // prevent double clicks
      this.isLoadingMore = true;
    }

    this.commentsService
      .list(this.cardId, {
        limit: this.pageSize,
        order: 'desc',
        cursor: this.cursor ?? undefined,
      })
      .pipe(
        finalize(() => {
          this.isInitialLoading = false;
          this.isLoadingMore = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.comments = initial
            ? res.elements
            : [...this.comments, ...res.elements];

          this.cursor = res.cursor ?? null;
          this.hasNext = !!res.hasNext;
          this.totalCount =
            typeof res.totalElements === 'number'
              ? res.totalElements
              : (this.totalCount ?? 0) + res.elements.length;
        },
        error: (err) => {
          console.error('Failed to retrieve comments', err);
          this.eventService.emitFlash({
            type: 'error',
            i18nKey: 'our_story.comments.error_retrieving_comments',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
        },
      });
  }

  onSubmit(): void {
    if (this.commentForm.invalid || this.isSubmitting) return;

    // Honeypot anti-spam
    if (this.commentForm.get('website')?.value) {
      return;
    }

    this.isSubmitting = true;
    this.eventService.emitLoadingMask(true);

    const nickname = (this.commentForm.get('authorName')?.value || '').trim();
    const messageHtml = this.commentForm.get('messageHtml')?.value || '';
    const recaptchaToken = this.commentForm.get('captcha')?.value || '';

    this.commentsService
      .create(this.cardId, { nickname, message: messageHtml, recaptchaToken })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.eventService.emitLoadingMask(false);
        })
      )
      .subscribe({
        next: (created) => {
          this.commentForm.reset(
            {
              authorName: '',
              messageHtml: '',
              privacyConsent: false,
              website: '',
              captcha: null,
            },
            { emitEvent: false }
          );
          this.currentLen = 0;

          // Notify success
          this.eventService.emitFlash({
            type: 'success',
            i18nKey: 'our_story.comments.success_message',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });

          // Reload from the beginning to reflect canonical order & counts
          this.resetAndLoad();

          // Still emit outside if parent cares
          this.commentAdded.emit(created);
        },
        error: (err) => {
          console.error('Failed to create comment', err);
          this.eventService.emitFlash({
            type: 'error',
            i18nKey: 'our_story.comments.error_creating_comment',
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
            'our_story.comments.errors.invalid_nickname_min'
          );
        }
        if (field.errors['maxlength']) {
          return this.translate.instant(
            'our_story.comments.errors.invalid_nickname_max'
          );
        }
        if (field.errors['pattern']) {
          return this.translate.instant(
            'our_story.comments.errors.invalid_nickname_chars'
          );
        }
      }
      if (fieldName === 'messageHtml' && field.errors['maxPlainTextLen']) {
        return this.translate.instant(
          'our_story.comments.errors.invalid_content'
        );
      }
    }
    return '';
  }

  toggleSubscribeBox(): void {
    this.showSubscribeBox = !this.showSubscribeBox;
  }

  subscribe(): void {
    if (!this.cardId) return;
    if (this.subscriptionForm.invalid || this.isSubscribing) return;

    const email = (this.subEmailCtrl?.value || '').trim();
    if (!email) return;

    // Honeypot anti-spam
    if (this.subscriptionForm.get('websiteSubscription')?.value) {
      return;
    }

    this.isSubscribing = true;
    const recaptchaToken = this.subscriptionForm.get('captchaSubscription')?.value || '';
    this.subscriptionsService
      .create(this.cardId, email, recaptchaToken) // <-- use SubscriptionsService here
      .pipe(finalize(() => (this.isSubscribing = false)))
      .subscribe({
        next: () => {
          this.isSubscribed = true;
          this.eventService.emitFlash({
            type: 'success',
            i18nKey: 'our_story.comments.subscriptions.subscribe_success',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
          this.showSubscribeBox = false;
        },
        error: (err) => {
          console.error('Subscribe failed', err);
          this.eventService.emitFlash({
            type: 'error',
            i18nKey: 'our_story.comments.subscriptions.subscribe_error',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
        },
      });
  }

  unsubscribe(): void {
    if (!this.cardId) return;

    const email = (this.subEmailCtrl?.value || '').trim();
    if (!email || this.isUnsubscribing) return;

    // Honeypot anti-spam
    if (this.commentForm.get('websiteSubscription')?.value) {
      return;
    }

    this.isUnsubscribing = true;
    this.subscriptionsService
      .delete(this.cardId, email)
      .pipe(finalize(() => (this.isUnsubscribing = false)))
      .subscribe({
        next: () => {
          this.isSubscribed = false;
          this.eventService.emitFlash({
            type: 'success',
            i18nKey: 'our_story.comments.subscriptions.unsubscribe_success',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
        },
        error: (err) => {
          console.error('Unsubscribe failed', err);
          this.eventService.emitFlash({
            type: 'error',
            i18nKey: 'our_story.comments.subscriptions.unsubscribe_error',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
        },
      });
  }
}
