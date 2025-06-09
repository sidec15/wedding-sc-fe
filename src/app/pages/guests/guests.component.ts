import { Component } from '@angular/core';
import { GuestsIntroComponent } from './components/guests-intro/guests-intro.component';
import { GuestsDirectionsChurchComponent } from './components/guests-directions-church/guests-directions-church.component';
import { GuestsDirectionsReceptionComponent } from './components/guests-directions-reception/guests-directions-reception.component';
import { GuestsContactFormComponent } from './components/guests-contact-form/guests-contact-form.component';
import { GuestsSaveTheDateComponent } from './components/guests-save-the-date/guests-save-the-date.component';
import { GuestsDayInfoComponent } from './components/guests-day-info/guests-day-info.component';

@Component({
  selector: 'app-guests',
  imports: [
    GuestsIntroComponent,
    GuestsDirectionsChurchComponent,
    GuestsDirectionsReceptionComponent,
    GuestsSaveTheDateComponent,
    GuestsContactFormComponent,
    GuestsDayInfoComponent
  ],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss',
})
export class GuestsComponent {}
