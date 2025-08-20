import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function plainTextRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const html = (control.value ?? '') as string;
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = (div.textContent || div.innerText || '').trim();
    return text.length > 0 ? null : { required: true };
  };
}

export function plainTextMaxLength(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const html = (control.value ?? '') as string;
    const div = document.createElement('div');
    div.innerHTML = html;
    const len = (div.textContent || div.innerText || '').length;
    return len <= max
      ? null
      : { maxPlainTextLen: { requiredLength: max, actualLength: len } };
  };
}
