import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterQualityLegendComponent } from './water-quality-legend.component';

describe('WaterQualityLegendComponent', () => {
  let component: WaterQualityLegendComponent;
  let fixture: ComponentFixture<WaterQualityLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterQualityLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterQualityLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
