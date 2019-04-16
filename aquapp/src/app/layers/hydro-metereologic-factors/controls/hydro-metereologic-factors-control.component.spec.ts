import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HydroMFControlComponent } from './hydro-metereologic-factors-control.component';

describe('HydroMetereologicFactorsControlComponent', () => {
  let component: HydroMFControlComponent;
  let fixture: ComponentFixture<HydroMFControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HydroMFControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HydroMFControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
