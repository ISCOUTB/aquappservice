import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWaterBodyPageComponent } from './edit-water-body-page.component';

describe('EditWaterBodyPageComponent', () => {
  let component: EditWaterBodyPageComponent;
  let fixture: ComponentFixture<EditWaterBodyPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWaterBodyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWaterBodyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
