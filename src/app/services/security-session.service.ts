import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface CaptchaSession { token: string; expiresAt: number; }

// Shape your backend returns from captcha-validator (adjust if needed)
interface CaptchaErrorPayload {
  code?: string;             // e.g., 'captcha_failed' | 'captcha_unavailable'
  reason?: 'expired' | 'invalid' | 'duplicate' | 'bad-request' | 'network-error' | 'server-error';
  errorCodes?: string[];     // google error codes (optional passthrough)
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SecuritySessionService {
  private readonly CAPTCHA_KEY = 'captchaSession';
  private readonly CONSENT_KEY = 'privacyConsentAccepted';

  private _captchaToken$ = new BehaviorSubject<string | null>(null);
  private _privacyConsent$ = new BehaviorSubject<boolean>(false);
  readonly captchaToken$ = this._captchaToken$.asObservable();
  readonly privacyConsent$ = this._privacyConsent$.asObservable();

  private expiryTimer: any = null;

  constructor() {
    // Initialize from sessionStorage on service construction
    const stored = this.readCaptchaFromStorage();
    if (stored) {
      this._captchaToken$.next(stored.token);
      this.scheduleExpiry(stored.expiresAt);
    }
    this._privacyConsent$.next(this.readConsentFromStorage());

    // Optional: handle visibility-change to catch background expiry
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.syncFromStorage();
    });
  }

  // ---- Public sync getters ----
  getCaptchaToken(): string | null { return this._captchaToken$.value; }
  hasPrivacyConsent(): boolean { return this._privacyConsent$.value; }

  // ---- Writes (call AFTER successful server validation) ----
  setCaptchaToken(token: string): void {
    const expiresAt = Date.now() + 2 * 60 * 1000; // ~120s
    const data: CaptchaSession = { token, expiresAt };
    sessionStorage.setItem(this.CAPTCHA_KEY, JSON.stringify(data));
    this._captchaToken$.next(token);
    this.scheduleExpiry(expiresAt);
  }

  clearCaptchaToken(): void {
    sessionStorage.removeItem(this.CAPTCHA_KEY);
    this._captchaToken$.next(null);
    this.clearExpiryTimer();
  }

  setPrivacyConsent(): void {
    sessionStorage.setItem(this.CONSENT_KEY, 'true');
    this._privacyConsent$.next(true);
  }

  // ---- Error helpers (frontend can import and use) ----

  /**
   * Returns true when the backend indicates the user needs to solve captcha again.
   * Expected cases: 400/403 with code 'captcha_failed' OR reason 'expired'|'invalid'|'duplicate'|'bad-request'.
   */
  isCaptchaFailed(err: any): boolean {
    const status = err?.status ?? err?.statusCode;
    const payload: CaptchaErrorPayload | undefined = err?.error ?? err?.body;
    const reason = payload?.reason;

    const isClientStatus = status === 400 || status === 403;
    const isClientReason =
      reason === 'expired' || reason === 'invalid' || reason === 'duplicate' || reason === 'bad-request';
    const isClientCode = payload?.code === 'captcha_failed';

    return Boolean(isClientStatus && (isClientReason || isClientCode));
  }

  /**
   * Returns true for transient/unavailable cases.
   * Expected cases: 502/503/504 with code 'captcha_unavailable' OR reason 'network-error'|'server-error'.
   */
  isCaptchaUnavailable(err: any): boolean {
    const status = err?.status ?? err?.statusCode;
    const payload: CaptchaErrorPayload | undefined = err?.error ?? err?.body;
    const reason = payload?.reason;

    const isServerStatus = status === 502 || status === 503 || status === 504 || status === 500;
    const isServerReason = reason === 'network-error' || reason === 'server-error';
    const isServerCode = payload?.code === 'captcha_unavailable';

    return Boolean(isServerStatus && (isServerReason || isServerCode));
  }

  /**
   * Convenience: if it's a captcha failure, clears the cached token so UI shows widget again.
   * Returns true if it handled (cleared), false otherwise.
   */
  handleCaptchaError(err: any): boolean {
    if (this.isCaptchaFailed(err)) {
      this.clearCaptchaToken();
      return true;
    }
    return false; // do not clear for unavailable/transient errors
  }

  // ---- internals ----
  private readCaptchaFromStorage(): CaptchaSession | null {
    const raw = sessionStorage.getItem(this.CAPTCHA_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as CaptchaSession;
      if (parsed.expiresAt > Date.now()) return parsed;
      // expired -> cleanup
      sessionStorage.removeItem(this.CAPTCHA_KEY);
      return null;
    } catch {
      sessionStorage.removeItem(this.CAPTCHA_KEY);
      return null;
    }
  }

  private readConsentFromStorage(): boolean {
    return sessionStorage.getItem(this.CONSENT_KEY) === 'true';
  }

  private scheduleExpiry(expiresAt: number): void {
    this.clearExpiryTimer();
    const delay = Math.max(0, expiresAt - Date.now());
    this.expiryTimer = setTimeout(() => this.clearCaptchaToken(), delay);
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private syncFromStorage(): void {
    // Re-check captcha expiry when tab becomes visible again
    const stored = this.readCaptchaFromStorage();
    if (!stored && this._captchaToken$.value) {
      // was present, now expired/removed -> emit null
      this.clearCaptchaToken();
    }
    // consent is simple boolean; keep as-is
  }
}
