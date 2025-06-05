import { NgForOf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { HeaderBgFillObserverDirective } from '../../../../directives/header-bg-fill-observer.directive';

@Component({
  selector: 'app-reception-location',
  imports: [TranslateModule, NgForOf, HeaderBgFillObserverDirective],
  templateUrl: './reception-location.component.html',
  styleUrl: './reception-location.component.scss',
})
export class ReceptionLocationComponent implements OnInit, OnDestroy {
  private static readonly imageTimeoutMs = 7000;

  images = [
    'images/reception/location/location-04.jpg',
    'images/reception/location/location-02.jpg',
    'images/reception/location/location-06.jpg',
  ];
  currentImageIndex = 0;

  private imageRotationSub!: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.imageRotationSub = interval(
      ReceptionLocationComponent.imageTimeoutMs
    ).subscribe(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.images.length;
    });
  }

  ngOnDestroy(): void {
    this.imageRotationSub?.unsubscribe();
  }
}
