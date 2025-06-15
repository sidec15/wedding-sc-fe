import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-privacy-policy',
  imports: [TranslateModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements AfterViewInit, OnDestroy {
  constructor(private headerService: HeaderService) {}

  ngAfterViewInit(): void {
    this.headerService.disableHeader();
  }

  ngOnDestroy(): void {
    this.headerService.enableHeader();
  }
}
