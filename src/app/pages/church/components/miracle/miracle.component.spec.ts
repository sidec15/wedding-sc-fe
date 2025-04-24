import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiracleComponent } from './miracle.component';

describe('MiracleComponent', () => {
  let component: MiracleComponent;
  let fixture: ComponentFixture<MiracleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiracleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiracleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
