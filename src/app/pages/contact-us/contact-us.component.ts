import { Component } from '@angular/core';
import { ContactFormComponent } from './components/contact-form/contact-form.component';

@Component({
  selector: 'app-contact-us',
  imports: [ContactFormComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {

}
