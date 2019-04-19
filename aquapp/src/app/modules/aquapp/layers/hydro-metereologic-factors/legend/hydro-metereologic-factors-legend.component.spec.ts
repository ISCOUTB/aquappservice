import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HydroMFLegendComponent } from './hydro-metereologic-factors-legend.component';

describe('WaterQualityLegendComponent', () => {
  let component: HydroMFLegendComponent;
  let fixture: ComponentFixture<HydroMFLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HydroMFLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HydroMFLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
