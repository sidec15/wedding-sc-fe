import {
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { MovingBackgroundComponent } from '../../../../components/moving-background/moving-background.component';

@Component({
  selector: 'app-miracle',
  standalone: true,
  imports: [TranslateModule, ParallaxImageComponent, MovingBackgroundComponent],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent {


}
