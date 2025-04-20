import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryMobileComponent } from './gallery-mobile.component';

describe('GalleryMobileComponent', () => {
  let component: GalleryMobileComponent;
  let fixture: ComponentFixture<GalleryMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
