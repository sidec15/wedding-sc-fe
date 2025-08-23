import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-unsubscribe',
  imports: [TranslateModule],
  templateUrl: './unsubscribe.component.html',
  styleUrl: './unsubscribe.component.scss',
})
export class UnsubscribeComponent {
  private route = inject(ActivatedRoute);

  constructor(private headerService: HeaderService) {}

  ngAfterViewInit(): void {
    this.headerService.disableHeader();
  }

  ngOnDestroy(): void {
    this.headerService.enableHeader();
  }

  status = computed(
    () => this.route.snapshot.queryParamMap.get('status') ?? 'error'
  );
  photo = computed(() => this.route.snapshot.queryParamMap.get('photo'));
  email = computed(() => this.route.snapshot.queryParamMap.get('email'));
}
