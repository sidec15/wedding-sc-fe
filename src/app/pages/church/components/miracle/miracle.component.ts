import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParallaxImageComponent } from '../../../../components/parallax-image/parallax-image.component';
import { EventService, ScrollEvent } from '../../../../services/event.service';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-miracle',
  standalone: true,
  imports: [TranslateModule, ParallaxImageComponent, NgClass, NgIf],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements OnInit, AfterViewInit, OnDestroy {
  private scrollSub!: Subscription;

  currentParagraph = 0;
  isMobile = false;

  @ViewChild('miracleSection', { static: true }) sectionRef!: ElementRef;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  ngOnInit(): void {
    this.isMobile = this.platformService.isMobile();
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isMobile()) return;

    this.scrollSub = this.eventService.scrollEvent$.subscribe((e) => {
      // this.onScroll(e);
    });
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }

  private onScroll(scroll: ScrollEvent): void {
    const rect = this.sectionRef.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const visibleRatio = (windowHeight - rect.top) / rect.height;
    const clampedRatio = Math.max(0, Math.min(1, visibleRatio));

    if (clampedRatio < 0.75) {
      this.currentParagraph = 0;
    } else if (clampedRatio < 0.9) {
      this.currentParagraph = 1;
    } else {
      this.currentParagraph = 2;
    }
  }
}
