import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => handleSplash())
  .catch((err) => console.error(err));

function handleSplash(): void {
  const queryParams = new URLSearchParams(window.location.search);
  const splash = document.getElementById('initial-splash');

  let shouldSkipSplash = queryParams.get('skipSplash') === 'true';
  // debug_sdc
  shouldSkipSplash = true;

  if (shouldSkipSplash) {
    if (splash) splash.remove();
    document.body.classList.remove('splash-active');

    // Clean the URL after skipping splash
    history.replaceState(null, '', window.location.pathname);
    return;
  }

  const slideUpDurationMs = 3000;
  const totalVisibleDurationMs = 3000;

  document.body.classList.add('splash-active');
  if (!splash) return;

  setTimeout(() => {
    splash.classList.add('hidden');
    document.body.classList.remove('splash-active');

    setTimeout(() => {
      splash.remove();
    }, slideUpDurationMs);
  }, totalVisibleDurationMs);
}
