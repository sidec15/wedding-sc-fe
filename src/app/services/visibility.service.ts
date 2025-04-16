import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GalleryStatus{
  isOpen: boolean;
  currentIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  private ringScrollEnabledSubject = new BehaviorSubject<boolean>(true);
  ringScrollEnabled$ = this.ringScrollEnabledSubject.asObservable();
  private galleryStatusSubject = new BehaviorSubject<GalleryStatus>({
    isOpen: false,
    currentIndex: 0,
  });
  galleryStatus$ = this.galleryStatusSubject.asObservable();

  setRingScrollEnabled(enabled: boolean): void {
    this.ringScrollEnabledSubject.next(enabled);
  }

  setGalleryStatus(status: GalleryStatus): void {
    this.galleryStatusSubject.next(status);
  }

  constructor() { }
}
