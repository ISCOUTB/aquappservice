import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcampffLegendComponent } from './icampff-legend.component';

describe('IcampffLegendComponent', () => {
  let component: IcampffLegendComponent;
  let fixture: ComponentFixture<IcampffLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcampffLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcampffLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
