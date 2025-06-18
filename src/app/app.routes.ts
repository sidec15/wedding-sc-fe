import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { OurStoryComponent } from './pages/our-story/our-story.component';
import { ChurchComponent } from './pages/church/church.component';
import { ReceptionComponent } from './pages/reception/reception.component';
import { GuestsComponent } from './pages/guests/guests.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route
  { path: 'our-story', component: OurStoryComponent }, // Our Story route
  { path: 'church', component: ChurchComponent }, // Church route
  { path: 'reception', component: ReceptionComponent }, // Reception route
  { path: 'guests', component: GuestsComponent }, // Guests route
  { path: 'privacy-policy', component: PrivacyPolicyComponent }, // Privacy Policy route
  { path: '**', redirectTo: '' } // Wildcard route to redirect to home
];