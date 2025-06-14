import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: [''],
      surname: [''],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(this.maxMessageLength)]],
      privacyConsent: [false, Validators.requiredTrue],
      // Honeypot field
      website: ['']
    });
  }

  onSubmit() {
    if (this.contactForm.get('website')?.value) {
      // If honeypot is filled, silently reject
      return;
    }

    if (this.contactForm.valid) {
      this.submitted = true;
      // TODO: Implement form submission
      console.log(this.contactForm.value);
    }
  }
}
