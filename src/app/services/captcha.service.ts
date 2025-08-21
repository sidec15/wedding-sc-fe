import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  onCaptchaResolved(
    token: string | null,
    control: AbstractControl<any, any> | null
  ): void {
    console.log('captcha resolved', token);
    control?.setValue(token);
  }

  onCaptchaError(control: AbstractControl<any, any> | null) {
    console.log('captcha error');
    control?.setValue(null);
  }
}
