import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TwoImagesComponent } from '../generic/two-images/two-images.component';
import { PlatformService } from '../../../../services/platform.service';
import { AsyncPipe } from '@angular/common';
import { EventService } from '../../../../services/event.service';
import { map, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ratisbonne',
  imports: [TranslateModule, TwoImagesComponent, AsyncPipe],
  templateUrl: './ratisbonne.component.html',
  styleUrl: './ratisbonne.component.scss',
  standalone: true,
})
export class RatisbonneComponent implements OnInit, OnDestroy {
  imageLeftSrc$!: Observable<string>;
  imageRightSrc$!: Observable<string>;

  private destroy$ = new Subject<void>();

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.imageLeftSrc$ = this.eventService.isMobile$.pipe(
      map((isMobile) =>
        isMobile
          ? '/images/church/ratisbonne/mobile/ratisbonne-01.jpg'
          : '/images/church/ratisbonne/ratisbonne-01.jpg'
      ),
      takeUntil(this.destroy$)
    );
    this.imageRightSrc$ = this.eventService.isMobile$.pipe(
      map((isMobile) =>
        isMobile
          ? '/images/church/ratisbonne/mobile/ratisbonne-02.jpg'
          : '/images/church/ratisbonne/ratisbonne-02.jpg'
      ),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
