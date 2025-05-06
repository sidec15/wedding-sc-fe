import {
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TwoImagesComponent } from '../generic/two-images/two-images.component';

@Component({
  selector: 'app-angels',
  imports: [TranslateModule, TwoImagesComponent],
  templateUrl: './angels.component.html',
  styleUrl: './angels.component.scss',
})
export class AngelsComponent {}
