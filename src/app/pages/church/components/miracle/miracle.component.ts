import {
  AfterViewInit,
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { PlatformService } from '../../../../services/platform.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-miracle',
<<<<<<< HEAD
  imports: [TranslateModule, ParallaxImageComponent,  NgIf],
=======
  imports: [TranslateModule, ParallaxImageComponent, NgIf],
>>>>>>> 035d3274a4a753eee203e036e610190509f906a8
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit {
  isMobile: boolean = false;

  constructor(private platformService: PlatformService) {}

  ngAfterViewInit(): void {
    this.isMobile = this.platformService.isMobile();
  }

  get imageSrc(): string {
    return !this.isMobile
      ? '/images/church/miracle/miracle-02.jpg'
      : '/images/church/miracle/miracle-09.jpg';
  }
}

