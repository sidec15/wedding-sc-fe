import { Component } from '@angular/core';
import { ReceptionIntroComponent } from './components/reception-intro/reception-intro.component';
import { ReceptionLocationComponent } from './components/reception-location/reception-location.component';
import { ReceptionMenuComponent } from './components/reception-menu/reception-menu.component';
import { ReceptionMapComponent } from './components/reception-map/reception-map.component';
import { ReceptionNotesComponent } from './components/reception-notes/reception-notes.component';

@Component({
  selector: 'app-reception',
  imports: [
    ReceptionIntroComponent,
    ReceptionLocationComponent,
    ReceptionMenuComponent,
    ReceptionMapComponent,
    ReceptionNotesComponent,
  ],
  templateUrl: './reception.component.html',
  styleUrl: './reception.component.scss',
})
export class ReceptionComponent {}
