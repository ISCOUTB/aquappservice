import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportSelectorComponent } from './export-selector.component';

describe('ExportSelectorComponent', () => {
  let component: ExportSelectorComponent;
  let fixture: ComponentFixture<ExportSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
