import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * @description Validator that checks if the plain text content of an HTML string is not empty.
 * This is useful for rich text editors where the content might contain HTML tags but appear empty to the user.
 * It leverages the browser's DOM parsing to convert HTML to plain text for accurate validation.
 * @returns A `ValidatorFn` that returns `{ required: true }` if the plain text content is empty, otherwise `null`.
 */
export function plainTextRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Get the HTML string value from the form control.
    const html = (control.value ?? '') as string;
    // Create a temporary div element to leverage browser's DOM parsing.
    const div = document.createElement('div');
    // Set the innerHTML of the div with the control's HTML value.
    // The browser automatically parses the HTML and makes the plain text available via textContent.
    div.innerHTML = html;
    // Extract the plain text content, trimming whitespace.
    // Use textContent for modern browsers, fallback to innerText for older ones.
    const text = (div.textContent || div.innerText || '').trim();
    // Return null if there is actual text content, otherwise return a 'required' error.
    return text.length > 0 ? null : { required: true };
  };
}

/**
 * @description Validator that checks if the plain text content of an HTML string exceeds a specified maximum length.
 * This is crucial for rich text editors where character limits should apply to visible text, not including HTML tags.
 * It uses the browser's DOM to convert HTML to plain text before checking the length.
 * @param max The maximum allowed length for the plain text content.
 * @returns A `ValidatorFn` that returns `{ maxPlainTextLen: { requiredLength: max, actualLength: len } }`
 *          if the plain text content exceeds the maximum length, otherwise `null`.
 */
export function plainTextMaxLength(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Get the HTML string value from the form control.
    const html = (control.value ?? '') as string;
    // Create a temporary div element to leverage browser's DOM parsing.
    const div = document.createElement('div');
    // Set the innerHTML of the div with the control's HTML value.
    // The browser automatically parses the HTML and makes the plain text available via textContent.
    div.innerHTML = html;
    // Extract the plain text content length.
    // Use textContent for modern browsers, fallback to innerText for older ones.
    const len = (div.textContent || div.innerText || '').length;
    // Return null if the plain text length is within the limit, otherwise return a 'maxPlainTextLen' error.
    return len <= max
      ? null
      : { maxPlainTextLen: { requiredLength: max, actualLength: len } };
  };
}
