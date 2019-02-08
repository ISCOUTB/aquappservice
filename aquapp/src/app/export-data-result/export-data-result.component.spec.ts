import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDataResultComponent } from './export-data-result.component';

describe('ExportDataResultComponent', () => {
  let component: ExportDataResultComponent;
  let fixture: ComponentFixture<ExportDataResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportDataResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDataResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
