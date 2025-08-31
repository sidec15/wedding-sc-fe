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
  hideCaptchaUI = false; // when a valid session token exists

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

    // Theme sync (keep your own distinctUntilChanged pipeline as you had)
    this.applyTheme(this.themeService.getCurrentThemeToApply(), true);
    this.subs.add(
      this.eventBus.theme$
        .pipe(distinctUntilChanged((a, b) => a.theme === b.theme))
        .subscribe(({ theme }) => this.applyTheme(theme))
    );

    // Subscribe to captcha token changes
    this.subs.add(
      this.session.captchaToken$
        .pipe(distinctUntilChanged())
        .subscribe((token) => {
          const ctrl = this.form.get(this.captchaControlName);
          if (!ctrl) return;

          if (token) {
            ctrl.setValue(token, { emitEvent: false });
            this.hideCaptchaUI = true;
          } else {
            // token expired/cleared -> show widget again
            this.hideCaptchaUI = false;
            ctrl.reset(null, { emitEvent: false });
          }
          this.cdr.markForCheck();
        })
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

    // If we’re hiding the widget due to session token, no need to remount
    if (this.hideCaptchaUI) return;

    this.form.get(this.captchaControlName)?.reset(null, { emitEvent: false });
    this.showCaptcha = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showCaptcha = true;
      this.cdr.detectChanges();
    });
  }

  // If you keep handlers, never write to storage here (submit success will do it)
  onCaptchaResolved(token: string | null): void {
    this.form
      .get(this.captchaControlName)
      ?.setValue(token, { emitEvent: false });
  }
  onCaptchaError(): void {
    /* optionally mark errors */
  }
}
