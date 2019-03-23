import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterBodiesComponent } from './water-bodies.component';

describe('WaterBodiesComponent', () => {
  let component: WaterBodiesComponent;
  let fixture: ComponentFixture<WaterBodiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterBodiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterBodiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
