import {
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IntroComponent } from './components/intro/intro.component';
import { EventService } from '../../services/event.service';
import { OriginsComponent } from './components/origins/origins.component';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { AngelsComponent } from './components/angels/angels.component';

@Component({
  selector: 'app-church',
  standalone: true,
  imports: [TranslateModule, IntroComponent, OriginsComponent, RingScrollComponent, AngelsComponent],
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
})
export class ChurchComponent {

}
