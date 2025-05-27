import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { PlatformService } from '../../../../services/platform.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-miracle',
  imports: [TranslateModule, ParallaxImageComponent, NgIf],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent {

  constructor(private platformService: PlatformService) {}

  get isMobile(): boolean {
    return this.platformService.isMobile();
  }
}
