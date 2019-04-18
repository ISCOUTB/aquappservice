import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AquAppComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: AquAppComponent;
  let fixture: ComponentFixture<AquAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AquAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AquAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
