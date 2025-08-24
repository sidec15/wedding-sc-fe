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

@Component({
  selector: 'app-contact-form',
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
    private eventService: EventService
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
      privacyConsent: [false, Validators.requiredTrue],
      website: [''], // Honeypot field
      captcha: ['', Validators.required], // Captcha field
    });
  }

  ngAfterViewInit(): void {
    this.isMobile = this.platformService.isMobile();
  }

  onSubmit() {
    this.submitted = true;

    // Honeypot anti-spam
    if (this.contactForm.get('website')?.value) {
      return;
    }

    // Enforce CAPTCHA
    if (!this.contactForm.get('captcha')?.value) {
      this.eventService.emitFlash({
        type: 'error',
        i18nKey: 'contact_us.contact_form.error_message',
        autoHide: true,
        dismissible: true,
      });
      return;
    }

    if (this.contactForm.valid) {
      this.eventService.emitLoadingMask(true);
      const formData = { ...this.contactForm.value };

      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === 'string') {
          formData[key] = securityUtils.sanitizeInput(formData[key]);
        }
      });

      const dto = {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        recaptchaToken: formData.captcha,
      };

      this.contactService.sendContactForm(dto).subscribe({
        next: () => {
          this.contactForm.reset();
          this.eventService.emitLoadingMask(false);
          this.eventService.emitFlash({
            type: 'info',
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
}
