import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';
import { EventService, ScrollEvent } from '../../../../services/event.service';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';

@Component({
  selector: 'app-miracle',
  standalone: true,
  imports: [TranslateModule, ParallaxImageComponent],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent {


}
