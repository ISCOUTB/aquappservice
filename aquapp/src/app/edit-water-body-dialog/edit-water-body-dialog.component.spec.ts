import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWaterBodyDialogComponent } from './edit-water-body-dialog.component';

describe('EditWaterBodyDialogComponent', () => {
  let component: EditWaterBodyDialogComponent;
  let fixture: ComponentFixture<EditWaterBodyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWaterBodyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWaterBodyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
