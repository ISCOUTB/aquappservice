import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDataFormComponent } from './export-data.component';

describe('ExportDataFormComponent', () => {
  let component: ExportDataFormComponent;
  let fixture: ComponentFixture<ExportDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
