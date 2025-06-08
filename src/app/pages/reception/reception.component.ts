import { Component } from '@angular/core';
import { ReceptionIntroComponent } from './components/reception-intro/reception-intro.component';
import { ReceptionLocationComponent } from './components/reception-location/reception-location.component';
import { ReceptionMenuComponent } from './components/reception-menu/reception-menu.component';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';

@Component({
  selector: 'app-reception',
  imports: [
    ReceptionIntroComponent,
    ReceptionLocationComponent,
    ReceptionMenuComponent,
    RingScrollComponent
  ],
  templateUrl: './reception.component.html',
  styleUrl: './reception.component.scss',
})
export class ReceptionComponent {}
