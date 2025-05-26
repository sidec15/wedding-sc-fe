import {
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { PlatformService } from '../../../../services/platform.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-miracle',
  imports: [TranslateModule, ParallaxImageComponent,  NgIf],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements OnInit {
  isMobile: boolean = false;

  constructor(private platformService: PlatformService) {}

  ngOnInit(): void {
    this.isMobile = this.platformService.isMobile();
  }

  get imageSrc(): string {
    return !this.isMobile
      ? '/images/church/miracle/miracle-02.jpg'
      : '/images/church/miracle/miracle-09.jpg';
  }
}

