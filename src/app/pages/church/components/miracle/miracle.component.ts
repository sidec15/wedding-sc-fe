import { NgFor, NgStyle } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-miracle',
  imports: [TranslateModule],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit, OnDestroy {

  constructor(private platfoemService: PlatformService) {}

  ngAfterViewInit() {
    if (!this.platfoemService.isBrowser()) return;
    
    
  }

  ngOnDestroy(): void {
    
  }

}
