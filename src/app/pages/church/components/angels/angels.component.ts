import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, ScrollEvent } from '../../../../services/event.service';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';
import { MovingBackgroundComponent } from '../../../../components/moving-background/moving-background.component';
import { TwoImagesComponent } from '../generic/two-images/two-images.component';

@Component({
  selector: 'app-angels',
  imports: [TranslateModule, TwoImagesComponent],
  templateUrl: './angels.component.html',
  styleUrl: './angels.component.scss',
})
export class AngelsComponent {}
