import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherStationLegendComponent } from './weather-station-legend.component';

describe('WaterQualityLegendComponent', () => {
  let component: WeatherStationLegendComponent;
  let fixture: ComponentFixture<WeatherStationLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WeatherStationLegendComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherStationLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
