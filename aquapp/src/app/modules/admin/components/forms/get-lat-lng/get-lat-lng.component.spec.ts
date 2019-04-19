import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetLatLngComponent } from './get-lat-lng.component';

describe('GetLatLngComponent', () => {
  let component: GetLatLngComponent;
  let fixture: ComponentFixture<GetLatLngComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetLatLngComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetLatLngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
