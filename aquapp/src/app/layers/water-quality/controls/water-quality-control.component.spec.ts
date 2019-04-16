import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterQualityControlComponent } from './water-quality-control.component';

describe('WaterQualityControlComponent', () => {
  let component: WaterQualityControlComponent;
  let fixture: ComponentFixture<WaterQualityControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterQualityControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterQualityControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
