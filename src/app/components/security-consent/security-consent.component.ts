import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha-2';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../services/platform.service';
import { EventService } from '../../services/event.service';
import { Theme } from '../../models/theme';
import { ThemeService } from '../../services/theme.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { SecuritySessionService } from '../../services/security-session.service';

@Component({
  selector: 'app-security-consent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
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

  recaptchaTheme: 'light' | 'dark' = 'dark';
  showCaptcha = true; // used for theme re-mount

  private subs = new Subscription();

  constructor(
    private platform: PlatformService,
    private eventBus: EventService,
    private themeService: ThemeService,
    private session: SecuritySessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.platform.isPlatformReady()) return;

    // Theme sync
    this.applyTheme(this.themeService.getCurrentThemeToApply(), true);
    this.subs.add(
      this.eventBus.theme$
        .pipe(distinctUntilChanged((a, b) => a.theme === b.theme))
        .subscribe(({ theme }) => this.applyTheme(theme))
    );

    // Subscribe to privacy consent changes
    this.subs.add(
      this.session.privacyConsent$
        .pipe(distinctUntilChanged())
        .subscribe((accepted) => {
          const ctrl = this.form.get(this.privacyControlName);
          ctrl?.setValue(accepted, { emitEvent: false });
          this.cdr.markForCheck();
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private applyTheme(theme: Theme, force = false): void {
    const newTheme: 'light' | 'dark' = theme === Theme.Dark ? 'dark' : 'light';
    if (!force && newTheme === this.recaptchaTheme) return;
    this.recaptchaTheme = newTheme;

    // Force remount the captcha widget (to apply new theme)
    this.form.get(this.captchaControlName)?.reset(null, { emitEvent: false });
    this.showCaptcha = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showCaptcha = true;
      this.cdr.detectChanges();
    });
  }

  onCaptchaResolved(token: string | null): void {
    // Just write to the form control; no caching in storage
    this.form.get(this.captchaControlName)?.setValue(token, { emitEvent: false });
  }

  onCaptchaError(): void {
    // Optionally set a validation error on the form control
    this.form.get(this.captchaControlName)?.setErrors({ error: true });
  }
}
