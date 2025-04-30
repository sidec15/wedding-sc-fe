import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-miracle',
  imports: [TranslateModule],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements OnDestroy {


  @ViewChild('miracleImage', { static: true }) miracleImageRef!: ElementRef;

  private imageConfigs: { url: string; position: string }[] = [
    { url: '/images/church/miracle/miracle-02.jpg', position: 'top center' },
    { url: '/images/church/miracle/miracle-06.png', position: 'center center' },
    { url: '/images/church/miracle/miracle-07.png', position: 'center center' },
  ];

  private readonly timeout = 10000; // milliseconds

  private currentImageIndex = 0;
  private intervalId!: any;

  constructor(private platformService: PlatformService) {}

  ngOnInit(): void {
    if(!this.platformService.isBrowser()) return;
    this.startImageCarousel();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startImageCarousel(): void {
    this.updateBackgroundImage(); // Set the initial image
    this.intervalId = setInterval(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.imageConfigs.length; // Cycle through images
      this.updateBackgroundImage();
    }, this.timeout); // Change image every 5 seconds
  }

  private updateBackgroundImage(): void {
    const miracleImageEl = this.miracleImageRef.nativeElement;
    const currentImage = this.imageConfigs[this.currentImageIndex];
    miracleImageEl.style.backgroundImage = `url('${currentImage.url}')`;
    // miracleImageEl.style.backgroundPosition = currentImage.position;
  }
  
}
