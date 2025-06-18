import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => handleSplash())
  .catch((err) => console.error(err));

  function handleSplash(): void {
    const excludedRoutes = ['/privacy-policy'];
    const currentPath = window.location.pathname;

    // Skip splash for certain routes
    if (excludedRoutes.includes(currentPath)) {
      const splash = document.getElementById('initial-splash');
      if (splash) splash.remove();
      document.body.classList.remove('splash-active');
      return;
    }

    const slideUpDurationMs = 3000;
    const totalVisibleDurationMs = 8000;

    const splash = document.getElementById('initial-splash');
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

