import {
  Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha-2';
import { CaptchaService } from '../../services/captcha.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../services/platform.service';
import { EventService, ThemeMessage } from '../../services/event.service';
import { Theme } from '../../models/theme';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-security-consent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RecaptchaModule, RecaptchaFormsModule, NgIf],
  templateUrl: './security-consent.component.html',
  styleUrls: ['./security-consent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityConsentComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  @Input() captchaControlName = 'captcha';
  @Input() privacyControlName = 'privacyConsent';
  @Input() submitted = false;
  @Input() privacyPolicyHref = '/privacy-policy?skipSplash=true';

  siteKey = environment.captcha.siteKey;

  // 1) Set initial theme BEFORE child reCAPTCHA runs its ngAfterViewInit
  recaptchaTheme: 'light' | 'dark' = 'dark';

  // 2) Toggle to force a full destroy/recreate when theme changes
  showCaptcha = true;

  private themeSub?: Subscription;

  constructor(
    private captchaService: CaptchaService,
    private platformService: PlatformService,
    private eventService: EventService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    // Set the initial theme synchronously
    this.applyTheme(this.themeService.getCurrentTheme(), /*force*/ true);

    // Then react to theme changes
    this.themeSub = this.eventService.theme$.subscribe((msg: ThemeMessage) => {
      this.applyTheme(msg.theme);
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  private applyTheme(theme: Theme, force = false): void {
    const newTheme: 'light' | 'dark' = theme === Theme.Dark ? 'dark' : 'light';
    if (!force && newTheme === this.recaptchaTheme) return;

    this.recaptchaTheme = newTheme;

    // ReCAPTCHA v2 requires re-render for theme change
    // Force unmount/remount of <re-captcha>
    this.showCaptcha = false;
    this.cdr.detectChanges(); // remove immediately

    // drop any previous token to avoid stale values
    this.form.get(this.captchaControlName)?.reset();

    setTimeout(() => {
      this.showCaptcha = true;   // recreate with new [theme]
      this.cdr.detectChanges();
      // console.log('reCAPTCHA re-rendered with theme:', this.recaptchaTheme);
    });
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
