import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParallaxCardComponent } from './parallax-card.component';

describe('ParallaxCardComponent', () => {
  let component: ParallaxCardComponent;
  let fixture: ComponentFixture<ParallaxCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParallaxCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParallaxCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
