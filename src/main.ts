import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    const splash = document.getElementById('initial-splash');

    if (splash) {
      // Add hidden class after 5 seconds
      setTimeout(() => {
        splash.classList.add('hidden');

        // Then remove from DOM after animation completes (0.8s)
        setTimeout(() => {
          splash.remove();
        }, 1500); // match transition duration in CSS
      }, 5000); // splash duration
    }
  })
  .catch((err) => console.error(err));
