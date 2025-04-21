import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../services/event.service';
import { PlatformService } from '../../../../services/platform.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-angels',
  imports: [TranslateModule],
  templateUrl: './angels.component.html',
  styleUrl: './angels.component.scss',
})
export class AngelsComponent implements OnInit, OnDestroy {
  private scrollEventSubscription!: Subscription;

  @ViewChild('angelLeft', { static: false })
  angelLeftRef!: ElementRef<HTMLElement>;
  @ViewChild('angelRight', { static: false })
  angelRightRef!: ElementRef<HTMLElement>;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    if (!this.platformService.isBrowser) return; // Ensure this runs only in the browser

    // this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
    //   (scrollY: number) => {
    //     this.animateAngels(scrollY);
    //   }
    // );
  }
  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

  private animateAngels(scrollY: number) {
    const speed = 0.1;
  
    const angelLeftImg = this.angelLeftRef?.nativeElement;
    const angelRightImg = this.angelRightRef?.nativeElement;
  
    if (angelLeftImg) {
      (angelLeftImg as HTMLElement).style.transform = `translateY(${scrollY * 0.5 * speed}px)`;
    }
  
    if (angelRightImg) {
      (angelRightImg as HTMLElement).style.transform = `translateY(${scrollY * 0.5 * speed}px)`;
    }
  }
  
}
