import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Payload shape the backend may return on captcha validation errors.
 * Adjust if your backend changes the error schema.
 */
interface CaptchaErrorPayload {
  code?: string;   // e.g. 'captcha_failed' | 'captcha_unavailable'
  reason?: 'expired' | 'invalid' | 'duplicate' | 'bad-request' | 'network-error' | 'server-error';
  errorCodes?: string[]; // raw Google error codes (optional passthrough)
  message?: string;
}

/**
 * SecuritySessionService
 *
 * Responsibilities:
 * - Persist privacy consent in `sessionStorage` so the user doesn’t need
 *   to check the box again during the same browser session.
 * - Expose privacy consent as an observable for components.
 * - Provide helper methods to classify captcha-related errors coming back
 *   from the backend, so components can show the right message.
 *
 * Note:
 * We no longer cache captcha tokens here (v2 tokens are single-use).
 */
@Injectable({ providedIn: 'root' })
export class SecuritySessionService {
  private readonly CONSENT_KEY = 'privacyConsentAccepted';

  private _privacyConsent$ = new BehaviorSubject<boolean>(false);
  /** Observable stream of current privacy consent state */
  readonly privacyConsent$ = this._privacyConsent$.asObservable();

  constructor() {
    // Initialize from sessionStorage on service construction
    this._privacyConsent$.next(this.readConsentFromStorage());
  }

  // ---- Privacy consent ----

  /** Returns the current consent state synchronously */
  hasPrivacyConsent(): boolean {
    return this._privacyConsent$.value;
  }

  /**
   * Persists privacy consent in sessionStorage and notifies observers.
   * Call this after a successful form submit where the user accepted consent.
   */
  setPrivacyConsent(): void {
    sessionStorage.setItem(this.CONSENT_KEY, 'true');
    this._privacyConsent$.next(true);
  }

  // ---- Captcha error classification ----

  /**
   * Returns true when the backend indicates the user needs to solve captcha again.
   *
   * Expected cases:
   * - HTTP 400 / 403 with `code = 'captcha_failed'`
   * - or `reason` in ['expired','invalid','duplicate','bad-request']
   */
  isCaptchaFailed(err: any): boolean {
    const status = err?.status ?? err?.statusCode;
    const payload: CaptchaErrorPayload | undefined = err?.error ?? err?.body;
    const reason = payload?.reason;

    const isClientStatus = status === 400 || status === 403;
    const isClientReason =
      reason === 'expired' ||
      reason === 'invalid' ||
      reason === 'duplicate' ||
      reason === 'bad-request';
    const isClientCode = payload?.code === 'captcha_failed';

    return Boolean(isClientStatus && (isClientReason || isClientCode));
  }

  /**
   * Returns true for transient/unavailable cases where captcha validation could not be performed.
   *
   * Expected cases:
   * - HTTP 502/503/504 (or 500) with `code = 'captcha_unavailable'`
   * - or `reason` in ['network-error','server-error']
   */
  isCaptchaUnavailable(err: any): boolean {
    const status = err?.status ?? err?.statusCode;
    const payload: CaptchaErrorPayload | undefined = err?.error ?? err?.body;
    const reason = payload?.reason;

    const isServerStatus =
      status === 502 || status === 503 || status === 504 || status === 500;
    const isServerReason =
      reason === 'network-error' || reason === 'server-error';
    const isServerCode = payload?.code === 'captcha_unavailable';

    return Boolean(isServerStatus && (isServerReason || isServerCode));
  }

  /**
   * Convenience: if it's a captcha failure (invalid/expired), return true.
   * Useful in error handlers to decide whether to reset the captcha control.
   * For transient/unavailable errors, returns false so the token is not cleared.
   */
  handleCaptchaError(err: any): boolean {
    return this.isCaptchaFailed(err);
  }

  // ---- internals ----

  private readConsentFromStorage(): boolean {
    return sessionStorage.getItem(this.CONSENT_KEY) === 'true';
  }
}
