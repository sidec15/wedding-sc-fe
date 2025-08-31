// security-session.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface CaptchaSession {
  token: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class SecuritySessionService {
  private readonly CAPTCHA_KEY = 'captchaSession';
  private readonly CONSENT_KEY = 'privacyConsentAccepted';

  // Subjects broadcast current session state
  private readonly _captchaToken$ = new BehaviorSubject<string | null>(
    this.readCaptchaTokenFromStorage()
  );
  private readonly _privacyConsent$ = new BehaviorSubject<boolean>(
    this.readPrivacyConsentFromStorage()
  );

  // Public streams (hot, replay last)
  readonly captchaToken$ = this._captchaToken$.asObservable();
  readonly privacyConsent$ = this._privacyConsent$.asObservable();

  // ===== Read current value (sync) =====
  getCaptchaToken(): string | null {
    return this._captchaToken$.value;
  }
  hasPrivacyConsent(): boolean {
    return this._privacyConsent$.value;
  }

  // ===== Write AFTER success =====
  setCaptchaToken(token: string): void {
    const data: CaptchaSession = {
      token,
      expiresAt: Date.now() + 2 * 60 * 1000,
    };
    sessionStorage.setItem(this.CAPTCHA_KEY, JSON.stringify(data));
    this._captchaToken$.next(token); // notify listeners
  }

  setPrivacyConsent(): void {
    sessionStorage.setItem(this.CONSENT_KEY, 'true');
    this._privacyConsent$.next(true); // notify listeners
  }

  // ===== Helpers =====
  private readCaptchaTokenFromStorage(): string | null {
    const raw = sessionStorage.getItem(this.CAPTCHA_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as CaptchaSession;
      if (parsed.expiresAt > Date.now()) return parsed.token;
      sessionStorage.removeItem(this.CAPTCHA_KEY);
      return null;
    } catch {
      sessionStorage.removeItem(this.CAPTCHA_KEY);
      return null;
    }
  }

  private readPrivacyConsentFromStorage(): boolean {
    return sessionStorage.getItem(this.CONSENT_KEY) === 'true';
  }
}
