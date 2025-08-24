import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RecaptchaModule } from 'ng-recaptcha-2';
import { CaptchaService } from '../../services/captcha.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../services/platform.service';
import { EventService, ThemeMessage } from '../../services/event.service';
import { Theme } from '../../models/theme';

@Component({
  selector: 'app-security-consent',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RecaptchaModule,
    NgIf,
  ],
  templateUrl: './security-consent.component.html',
  styleUrls: ['./security-consent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityConsentComponent implements AfterViewInit, OnDestroy {
  /** Parent reactive form (already contains 'captcha' and 'privacyConsent') */
  @Input({ required: true }) form!: FormGroup;

  /** Control names (optional overrides) */
  @Input() captchaControlName = 'captcha';
  @Input() privacyControlName = 'privacyConsent';

  /** Error display */
  @Input() submitted = false;

  /** Link to privacy policy */
  @Input() privacyPolicyHref = '/privacy-policy?skipSplash=true';

  /** reCAPTCHA site key */
  siteKey = environment.captcha.siteKey;

  recaptchaTheme: 'light' | 'dark' = 'light';
  private themeSub?: Subscription;

  showCaptcha = true;

  constructor(
    private captchaService: CaptchaService,
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    this.themeSub = this.eventService.theme$.subscribe((msg: ThemeMessage) => {
      this.setTheme(msg.theme);
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  // security-consent.component.ts
  private setTheme(theme: Theme): void {
    const newTheme = theme === Theme.Dark ? 'dark' : 'light';

    if (this.recaptchaTheme !== newTheme) {
      this.recaptchaTheme = newTheme;

      // Force Angular to destroy and recreate the captcha component
      this.showCaptcha = false;
      setTimeout(() => (this.showCaptcha = true));
    }

    console.log('Using theme', this.recaptchaTheme);
  }

  onCaptchaResolved(token: string | null): void {
    const ctrl = this.form.get(this.captchaControlName);
    this.captchaService.onCaptchaResolved(token, ctrl);
  }

  onCaptchaError(): void {
    const ctrl = this.form.get(this.captchaControlName);
    this.captchaService.onCaptchaError(ctrl);
  }
}
