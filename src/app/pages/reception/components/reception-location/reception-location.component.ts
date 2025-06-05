import { NgForOf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { HeaderBgFillObserverDirective } from '../../../../directives/header-bg-fill-observer.directive';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-reception-location',
  imports: [TranslateModule, NgForOf],
  templateUrl: './reception-location.component.html',
  styleUrl: './reception-location.component.scss',
})
export class ReceptionLocationComponent implements AfterViewInit, OnDestroy {
  private static readonly imageTimeoutMs = 6000;

  images = [
    'images/reception/location/location-04.jpg',
    'images/reception/location/location-02.jpg',
    'images/reception/location/location-06.jpg',
  ];
  currentImageIndex = 0;

  private imageRotationSub!: Subscription;


@ViewChild('p1', { static: true }) p1!: ElementRef;
@ViewChild('p2', { static: true }) p2!: ElementRef;
@ViewChild('p3', { static: true }) p3!: ElementRef;

@HostListener('window:scroll', [])
onScroll(): void {
  const triggerPoint = window.innerHeight * 0.85;

  [this.p1, this.p2, this.p3].forEach((el) => {
    const top = el.nativeElement.getBoundingClientRect().top;
    if (top < triggerPoint) {
      el.nativeElement.classList.add('visible');
    }
  });
}




  constructor(private platformService: PlatformService) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;

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
