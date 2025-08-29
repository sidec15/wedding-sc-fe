import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { OurStoryComponent } from './pages/our-story/our-story.component';
import { ChurchComponent } from './pages/church/church.component';
import { ReceptionComponent } from './pages/reception/reception.component';
import { GuestsComponent } from './pages/guests/guests.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { UnsubscribeComponent } from './pages/unsubscribe/unsubscribe.component';

export const routes: Routes = [
  {
    path: '',
    // canDeactivate: [closeMenuOnBackGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'our-story', component: OurStoryComponent },
      { path: 'church', component: ChurchComponent },
      { path: 'reception', component: ReceptionComponent },
      { path: 'guests', component: GuestsComponent },
      { path: 'contact-us', component: ContactUsComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'unsubscribe', component: UnsubscribeComponent },
      { path: '**', redirectTo: '' }
    ]
  }
];
