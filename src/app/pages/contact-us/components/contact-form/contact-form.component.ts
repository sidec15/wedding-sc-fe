import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';
import { ContactService } from '../../services/contact.service';
import { EventService } from '../../../../services/event.service';
import * as securityUtils from '../../../../utils/security.utils';
import { SecurityConsentComponent } from '../../../../components/security-consent/security-consent.component';
import { SecuritySessionService } from '../../../../services/security-session.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SecurityConsentComponent,
  ],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements AfterViewInit {
  contactForm: FormGroup;
  submitted = false;
  maxMessageLength = 1000;
  maxNameLength = 50;
  maxSurnameLength = 50;
  isMobile = false;

  // Phone regex that allows international format
  private phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

  constructor(
    private fb: FormBuilder,
    private platformService: PlatformService,
    private contactService: ContactService,
    private eventService: EventService,
    private securitySession: SecuritySessionService
  ) {
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
        [Validators.required, Validators.maxLength(this.maxMessageLength)],
      ],

      // Section-scoped security fields
      privacyContactForm: [false, Validators.requiredTrue],
      captchaContactForm: ['', Validators.required],
      websiteContactForm: [''], // Honeypot
    });
  }

  ngAfterViewInit(): void {
    this.isMobile = this.platformService.isMobile();
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

    this.contactService.sendContactForm(dto).subscribe({
      next: () => {
        // Persist to session AFTER success (so other sections can skip)
        if (recaptchaToken)
          this.securitySession.setCaptchaToken(recaptchaToken);
        if (privacyAccepted) this.securitySession.setPrivacyConsent();

        // Reset and prefill from session
        this.contactForm.reset(
          {
            name: '',
            surname: '',
            phone: '',
            email: '',
            message: '',
            privacyContactForm: this.securitySession.hasPrivacyConsent(),
            captchaContactForm: this.securitySession.getCaptchaToken(),
            websiteContactForm: '',
          },
          { emitEvent: false }
        );

        this.eventService.emitLoadingMask(false);
        this.eventService.emitFlash({
          type: 'success',
          i18nKey: 'contact_us.contact_form.success_message',
          autoHide: true,
          dismissible: true,
        });
        this.submitted = false;
      },
      error: (err) => {
        this.eventService.emitLoadingMask(false);
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
