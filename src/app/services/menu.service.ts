import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService, MenuEvent } from './event.service';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private _isMenuOpened = false;
  private _isMenuClosing = false; // Track if the menu is closing
  private readonly closeMenuTimeout = 3600; // 2.4s (item delay) + 1.2s (container slide)

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  toggleMenu(): void {
    if (!this.platformService.isMobile()) return;
    if (this._isMenuOpened) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  isMenuOpened(): boolean {
    return this._isMenuOpened;
  }

  isMenuClosing(): boolean {
    return this._isMenuClosing;
  }

  closeMenu(): void {
    if (!this._isMenuOpened) return; // Ignore if menu is already closed
    if (this._isMenuClosing) return; // Ignore if menu is already closing

    this._isMenuClosing = true; // Set the flag to indicate menu is closing

    this.eventService.emitMenuEvent({ status: 'closeStart' } as MenuEvent); // Emit menu close event

    setTimeout(() => {
      this._isMenuOpened = false;
      this._isMenuClosing = false; // Reset the flag after closing
      this.eventService.emitMenuEvent({ status: 'closeEnd' } as MenuEvent); // Emit menu close end event
    }, this.closeMenuTimeout);
  }

  openMenu(): void {
    if (this._isMenuOpened) return; // Ignore if menu is already open
    if (this._isMenuClosing) return; // Ignore if menu is already closing
    this._isMenuOpened = true;
    this.eventService.emitMenuEvent({ status: 'openStart' } as MenuEvent); // Emit menu open event
  }
}
