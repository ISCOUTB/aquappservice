import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherStationControlComponent } from './weather-station-control.component';

describe('WeatherStationControlComponent', () => {
  let component: WeatherStationControlComponent;
  let fixture: ComponentFixture<WeatherStationControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherStationControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherStationControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
