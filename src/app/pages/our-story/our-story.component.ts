import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OurStoryDesktopComponent } from './desktop/our-story.desktop.component';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-our-story',
  standalone: true,
  imports: [TranslateModule, OurStoryDesktopComponent],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
  providers: [],
})
export class OurStoryComponent {
  constructor(private platformService: PlatformService) {}

  get isMobile(): boolean {
    return this.platformService.isMobile();
  }

  get isDesktop(): boolean {
    return !this.isMobile;
  }
}
