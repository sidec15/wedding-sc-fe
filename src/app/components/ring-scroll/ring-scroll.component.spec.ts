import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingScrollComponent } from './ring-scroll.component';

describe('RingScrollComponent', () => {
  let component: RingScrollComponent;
  let fixture: ComponentFixture<RingScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RingScrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RingScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
