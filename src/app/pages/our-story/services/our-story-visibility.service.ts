import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GalleryStatus{
  isOpen: boolean;
  currentIndex: number;
}

@Injectable()
export class OurStoryVisibilityService {
  private galleryStatusSubject = new BehaviorSubject<GalleryStatus>({
    isOpen: false,
    currentIndex: 0,
  });
  galleryStatus$ = this.galleryStatusSubject.asObservable();

  emitGalleryStatus(status: GalleryStatus): void {
    this.galleryStatusSubject.next(status);
  }

  constructor() { }
}
