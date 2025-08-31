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
import { SecuritySessionService } from '../../../../services/security-session.service';

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

  // Comment list state
  comments: Comment[] = [];
  pageSize = 2;
  cursor: string | null = null;
  hasNext = false;
  totalCount: number | null = null;

  // Loading flags
  isInitialLoading = false;
  isLoadingMore = false;

  // Subscription form state
  isSubscribing = false;
  isUnsubscribing = false;
  showSubscribeBox = false;
  isSubscribed = false;

  // Forms
  commentForm: FormGroup;
  subscriptionForm: FormGroup;

  // UI
  isCommentSubmitting = false;
  maxCommentLength = 1000;
  commentCharCount = 0;
  maxNicknameLength = 20;
  nicknamePattern = /^[a-zA-Z0-9' -]+$/;
  toastDurationMs = 5000;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private eventService: EventService,
    private commentsService: CommentsService,
    private subscriptionsService: SubscriptionsService,
    private securitySessionService: SecuritySessionService
  ) {
    // Comment form with section-explicit control names
    this.commentForm = this.fb.group({
      authorName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(this.maxNicknameLength),
          Validators.pattern(this.nicknamePattern),
        ],
      ],
      messageHtml: [
        '',
        [plainTextRequired(), plainTextMaxLength(this.maxCommentLength)],
      ],
      privacyCommentCreate: [false, Validators.requiredTrue],
      captchaCommentCreate: ['', Validators.required],
      websiteCommentCreate: [''], // honeypot
    });

    // Subscription form with section-explicit control names
    this.subscriptionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      privacySubscription: [false, Validators.requiredTrue],
      captchaSubscription: ['', Validators.required],
      websiteSubscription: [''], // honeypot
    });
  }

  // Reload when photo/card changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardId'] && this.cardId) {
      this.resetAndLoad();
    }
  }

  get subscriptionEmailControl() {
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

  // === Comment create ===
  onSubmit(): void {
    if (this.commentForm.invalid || this.isCommentSubmitting) return;

    // Honeypot anti-spam
    if (this.commentForm.get('websiteCommentCreate')?.value) return;

    this.isCommentSubmitting = true;
    this.eventService.emitLoadingMask(true);

    const nickname = (this.commentForm.get('authorName')?.value || '').trim();
    const messageHtml = this.commentForm.get('messageHtml')?.value || '';
    const recaptchaToken = (this.commentForm.get('captchaCommentCreate')
      ?.value || null) as string | null;
    const privacyAccepted = !!this.commentForm.get('privacyCommentCreate')
      ?.value;

    this.commentsService
      .create(this.cardId, {
        nickname,
        message: messageHtml,
        recaptchaToken: recaptchaToken ?? '',
      })
      .pipe(
        finalize(() => {
          this.isCommentSubmitting = false;
          this.eventService.emitLoadingMask(false);
        })
      )
      .subscribe({
        next: (created) => {
          // >>> Persist to session AFTER success and BEFORE reset
          if (recaptchaToken)
            this.securitySessionService.setCaptchaToken(recaptchaToken);
          if (privacyAccepted) this.securitySessionService.setPrivacyConsent();

          // Reset the form (optionally preserve remembered state)
          this.commentForm.reset(
            {
              authorName: '',
              messageHtml: '',
              privacyCommentCreate:
                this.securitySessionService.hasPrivacyConsent(),
              captchaCommentCreate:
                this.securitySessionService.getCaptchaToken(),
              websiteCommentCreate: '',
            },
            { emitEvent: false }
          );
          this.commentCharCount = 0;

          // Notify success
          this.eventService.emitFlash({
            type: 'success',
            i18nKey: 'our_story.comments.success_message',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });

          // Reload list & emit event
          this.resetAndLoad();
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

  get messageControl() {
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

  // === Subscriptions ===
  subscribe(): void {
    if (!this.cardId) return;
    if (this.subscriptionForm.invalid || this.isSubscribing) return;

    // Honeypot anti-spam
    if (this.subscriptionForm.get('websiteSubscription')?.value) return;

    const email = (this.subscriptionEmailControl?.value || '').trim();
    if (!email) return;

    this.isSubscribing = true;
    const recaptchaToken = (this.subscriptionForm.get('captchaSubscription')
      ?.value || null) as string | null;
    const privacyAccepted = !!this.subscriptionForm.get('privacySubscription')
      ?.value;

    this.subscriptionsService
      .create(this.cardId, email, recaptchaToken ?? '')
      .pipe(finalize(() => (this.isSubscribing = false)))
      .subscribe({
        next: () => {
          this.isSubscribed = true;

          // >>> Persist to session AFTER success
          if (recaptchaToken)
            this.securitySessionService.setCaptchaToken(recaptchaToken);
          if (privacyAccepted) this.securitySessionService.setPrivacyConsent();

          this.eventService.emitFlash({
            type: 'success',
            i18nKey: 'our_story.comments.subscriptions.subscribe_success',
            autoHide: true,
            hideAfterMs: this.toastDurationMs,
            dismissible: true,
          });
          this.showSubscribeBox = false;

          // Optional: reset preserving remembered state
          this.subscriptionForm.reset(
            {
              email: '',
              privacySubscription:
                this.securitySessionService.hasPrivacyConsent(),
              captchaSubscription:
                this.securitySessionService.getCaptchaToken(),
              websiteSubscription: '',
            },
            { emitEvent: false }
          );
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

}
