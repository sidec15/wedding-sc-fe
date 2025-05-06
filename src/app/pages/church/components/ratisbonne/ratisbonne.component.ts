import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TwoImagesComponent } from '../generic/two-images/two-images.component';

@Component({
  selector: 'app-ratisbonne',
  imports: [TranslateModule, TwoImagesComponent],
  templateUrl: './ratisbonne.component.html',
  styleUrl: './ratisbonne.component.scss'
})
export class RatisbonneComponent {

}
