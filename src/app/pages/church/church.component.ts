import {
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IntroComponent } from './components/intro/intro.component';
import { OriginsComponent } from './components/origins/origins.component';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { AngelsComponent } from './components/angels/angels.component';
import { MiracleComponent } from './components/miracle/miracle.component';
import { RatisbonneComponent } from "./components/ratisbonne/ratisbonne.component";
import { MedalComponent } from "./components/medal/medal.component";

@Component({
  selector: 'app-church',
  standalone: true,
  imports: [TranslateModule, IntroComponent, OriginsComponent, RingScrollComponent, AngelsComponent, MiracleComponent, RatisbonneComponent, MedalComponent],
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
})
export class ChurchComponent {

}
