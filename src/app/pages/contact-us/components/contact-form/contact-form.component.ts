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
import { environment } from '../../../../../environments/environment';
import { RecaptchaModule } from 'ng-recaptcha-2';

@Component({
  selector: 'app-contact-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RecaptchaModule,
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
  responseMessageTimeoutMs = 3000;
  showSuccess = false;
  showError = false;
  isMobile = false;
  captchaKey = environment.captcha.siteKey;

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
      // Honeypot field
      website: [''],
      // Captcha field
      captcha: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.isMobile = this.platformService.isMobile();
  }

  private sanitizeInput(value: string): string {
    return value
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove on* event handlers
      .trim();
  }

  onSubmit() {
    this.submitted = true;

    // Honeypot field check to prevent spam.
    // If the honeypot field is filled, return.
    if (this.contactForm.get('website')?.value) {
      return;
    }

    // Enforce CAPTCHA
    if (!this.contactForm.get('captcha')?.value) {
      console.log('captcha not valid');
      console.log(this.contactForm.get('captcha')?.value);
      this.showError = true;
      return;
    }

    // If the form is valid, send the data to the server.
    if (this.contactForm.valid) {
      this.eventService.emitLoadingMask(true);
      const formData = { ...this.contactForm.value };

      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === 'string') {
          formData[key] = this.sanitizeInput(formData[key]);
        }
      });

      const dto = {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        captcha: formData.captcha,
      };

      this.contactService.sendContactForm(dto).subscribe({
        next: () => {
          this.contactForm.reset();
          this.eventService.emitLoadingMask(false);
          this.showSuccess = true;
          this.submitted = false;
          setTimeout(() => {
            this.showSuccess = false;
          }, this.responseMessageTimeoutMs);
        },
        error: (err) => {
          this.eventService.emitLoadingMask(false);
          console.error('Contact form submission failed', err);
          // show error message to user
          this.showError = true;
          setTimeout(() => {
            this.showError = false;
          }, this.responseMessageTimeoutMs);
        },
      });
    }

  }

  onCaptchaResolved(token: string | null): void {
    console.log('captcha resolved', token);
    this.contactForm.get('captcha')?.setValue(token);
  }

}
