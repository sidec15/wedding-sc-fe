import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => handleSplash())
  .catch((err) => console.error(err));

function handleSplash(): void {
  const slideUpDurationMs = 3000; // duration of the slide-up transition
  const totalVisibleDurationMs = 6000; // total time splash is visible

  const splash = document.getElementById('initial-splash');
  document.body.classList.add('splash-active');

  if (!splash) return;

  // Wait for content to be visible
  // setTimeout(() => {
  //   splash.classList.add('hidden');
  //   document.body.classList.remove('splash-active');

  //   // Wait for slide-up transition
  //   setTimeout(() => {
  //     splash.remove();
  //   }, slideUpDurationMs); // match transition duration
  // }, totalVisibleDurationMs);
}
