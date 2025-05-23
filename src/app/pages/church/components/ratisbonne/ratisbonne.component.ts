import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TwoImagesComponent } from '../generic/two-images/two-images.component';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-ratisbonne',
  imports: [TranslateModule, TwoImagesComponent],
  templateUrl: './ratisbonne.component.html',
  styleUrl: './ratisbonne.component.scss',
})
export class RatisbonneComponent {
  constructor(private platformService: PlatformService) {}

  
  get imageLeftSrc(): string {
    return !this.platformService.isMobile()
      ? '/images/church/ratisbonne/ratisbonne-01.jpg'
      : '/images/church/ratisbonne/mobile/ratisbonne-01.jpg';
  }

  get imageRightSrc(): string {
    return !this.platformService.isMobile()
      ? '/images/church/ratisbonne/ratisbonne-02.jpg'
      : '/images/church/ratisbonne/mobile/ratisbonne-02.jpg';
  }

}
