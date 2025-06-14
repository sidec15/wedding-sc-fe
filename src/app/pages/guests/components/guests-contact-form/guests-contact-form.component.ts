import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-guests-contact-form',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgIf],
  templateUrl: './guests-contact-form.component.html',
  styleUrls: ['./guests-contact-form.component.scss']
})
export class GuestsContactFormComponent {
  contactForm: FormGroup;
  submitted = false;
  maxMessageLength = 1000;
  maxNameLength = 50;
  maxSurnameLength = 50;
  successMessageTimeoutMs = 3000;
  showSuccess = false;

  // Phone regex that allows international format
  private phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.maxLength(this.maxNameLength)]],
      surname: ['', [Validators.maxLength(this.maxSurnameLength)]],
      phone: ['', [Validators.pattern(this.phoneRegex)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(this.maxMessageLength)]],
      privacyConsent: [false, Validators.requiredTrue],
      // Honeypot field
      website: ['']
    });
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

    if (this.contactForm.get('website')?.value) {
      // If honeypot is filled, silently reject
      return;
    }

    if (this.contactForm.valid) {
      const formData = { ...this.contactForm.value };

      // Sanitize all text inputs
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'string') {
          formData[key] = this.sanitizeInput(formData[key]);
        }
      });

      console.log(formData);
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
        this.submitted = false;
        this.contactForm.reset();
      }, this.successMessageTimeoutMs);
    }
  }
}
