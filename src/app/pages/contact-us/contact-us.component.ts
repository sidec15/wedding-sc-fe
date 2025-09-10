import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { EventService } from '../../services/event.service';
import { SecuritySessionService } from '../../services/security-session.service';
import { ContactService } from './services/contact.service';
import { SecurityConsentComponent } from '../../components/security-consent/security-consent.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as securityUtils from '../../utils/security.utils';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';
import { plainTextRequired, plainTextMaxLength } from '../../components/rich-text-editor/validators/validators';

@Component({
  selector: 'app-contact-us',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SecurityConsentComponent,
    RichTextEditorComponent
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent {
  contactForm: FormGroup;
  submitted = false;
  maxMessageLength = 1000;
  maxNameLength = 50;
  maxSurnameLength = 50;

  messageCharCount = 0;


  readonly isMobile$;

  private readonly translate: TranslateService;

  // Phone regex that allows international format
  private phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private eventService: EventService,
    private securitySession: SecuritySessionService,
    private translateService: TranslateService
  ) {
    this.isMobile$ = this.eventService.isMobile$;
    this.translate = this.translateService;
    this.contactForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.maxLength(this.maxNameLength)],
      ],
      surname: [
        '',
        [Validators.required, Validators.maxLength(this.maxSurnameLength)],
      ],
      phone: ['', [Validators.pattern(this.phoneRegex)]],
      email: ['', [Validators.email]],
      message: [
        '',
        [plainTextRequired(), plainTextMaxLength(this.maxMessageLength)],
      ],

      // Section-scoped security fields
      privacyContactForm: [false, Validators.requiredTrue],
      captchaContactForm: [null, Validators.required],
      websiteContactForm: [''], // Honeypot
    });
  }

  get messageControl() {
    return this.contactForm.get('message');
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.translate.instant(
          'rich_text_editor.errors.required_fields'
        );
      }
      if (fieldName === 'message') {
        if (field.errors['minlength']) {
          return this.translate.instant(
            'contact_us.contact_form.message_required'
          );
        }
        if (field.errors['maxlength']) {
          return this.translate.instant(
            'contact_us.contact_form.message_too_long'
          );
        }
      }
    }
    return '';
  }

  onSubmit(): void {
    this.submitted = true;

    // Honeypot anti-spam
    if (this.contactForm.get('websiteContactForm')?.value) return;

    if (!this.contactForm.valid) return;

    this.eventService.emitLoadingMask(true);

    // Build sanitized DTO
    const raw = { ...this.contactForm.value };
    Object.keys(raw).forEach((k) => {
      if (typeof raw[k] === 'string')
        raw[k] = securityUtils.sanitizeInput(raw[k]);
    });

    const recaptchaToken = (raw.captchaContactForm || null) as string | null;
    const privacyAccepted = !!raw.privacyContactForm;

    const dto = {
      name: raw.name,
      surname: raw.surname,
      phone: raw.phone,
      email: raw.email,
      message: raw.message,
      recaptchaToken: recaptchaToken ?? '',
    };

    this.contactService
      .sendContactForm(dto)
      .pipe(finalize(() => this.eventService.emitLoadingMask(false)))
      .subscribe({
        next: () => {
          // Persist to session AFTER success (so other sections can skip)
          if (privacyAccepted) this.securitySession.setPrivacyConsent();

          // Reset and prefill from session
          //debug_sdc
          this.contactForm.reset(
            {
              name: '',
              surname: '',
              phone: '',
              email: '',
              message: '',
              privacyContactForm: this.securitySession.hasPrivacyConsent(),
              captchaContactForm: null,
              websiteContactForm: '',
            },
            { emitEvent: false }
          );

          this.eventService.emitFlash({
            type: 'success',
            i18nKey: 'contact_us.contact_form.success_message',
            autoHide: true,
            dismissible: true,
          });
          this.submitted = false;
        },

        error: (err) => {
          // Captcha-specific handling
          if (this.securitySession.handleCaptchaError(err)) {
            // Clear control so the widget shows again immediately
            this.contactForm
              .get('captchaContactForm')
              ?.reset(null, { emitEvent: false });

            this.eventService.emitFlash({
              type: 'error',
              i18nKey: 'security.captcha_expired_or_invalid',
              autoHide: true,
              dismissible: true,
            });
            return;
          }

          if (this.securitySession.isCaptchaUnavailable(err)) {
            this.eventService.emitFlash({
              type: 'error',
              i18nKey: 'security.captcha_unavailable_try_later',
              autoHide: true,
              dismissible: true,
            });
            return;
          }

          // Fallback: generic error
          console.error('Contact form submission failed', err);
          this.eventService.emitFlash({
            type: 'error',
            i18nKey: 'contact_us.contact_form.error_message',
            autoHide: true,
            dismissible: true,
          });
        },
      });
  }
}
