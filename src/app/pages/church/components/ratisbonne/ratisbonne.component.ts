import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';

@Component({
  selector: 'app-ratisbonne',
  imports: [TranslateModule, ParallaxImageComponent],
  templateUrl: './ratisbonne.component.html',
  styleUrl: './ratisbonne.component.scss'
})
export class RatisbonneComponent {

}
