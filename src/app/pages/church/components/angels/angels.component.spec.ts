import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngelsComponent } from './angels.component';

describe('AngelsComponent', () => {
  let component: AngelsComponent;
  let fixture: ComponentFixture<AngelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
