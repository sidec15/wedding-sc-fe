import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-miracle',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit {
  @ViewChild('miracleImage', { static: true }) miracleImageRef!: ElementRef;

  constructor(private platformService: PlatformService) {}

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      this.onScroll(); // initialize immediately
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.miracleImageRef) return;

    const el = this.miracleImageRef.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Compute how much of the section is visible
    const progress = 1 - rect.top / windowHeight;

    // Apply subtle parallax effect
    const translateY = Math.min(Math.max(progress * 50, -50), 50); // clamp between -50 and 50px
    el.style.transform = `translateY(${translateY}px)`;
  }
}
