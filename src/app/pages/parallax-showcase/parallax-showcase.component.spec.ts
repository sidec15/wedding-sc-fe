import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParallaxShowcaseComponent } from './parallax-showcase.component';

describe('ParallaxShowcaseComponent', () => {
  let component: ParallaxShowcaseComponent;
  let fixture: ComponentFixture<ParallaxShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParallaxShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParallaxShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
