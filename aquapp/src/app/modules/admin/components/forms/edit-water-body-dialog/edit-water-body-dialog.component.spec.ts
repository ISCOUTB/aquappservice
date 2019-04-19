import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWaterBodyDiagComponent } from './edit-water-body-dialog.component';

describe('EditWaterBodyDialogComponent', () => {
  let component: EditWaterBodyDiagComponent;
  let fixture: ComponentFixture<EditWaterBodyDiagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWaterBodyDiagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWaterBodyDiagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
