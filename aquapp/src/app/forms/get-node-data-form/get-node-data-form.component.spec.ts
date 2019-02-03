import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetNodeDataFormComponent } from './get-node-data-form.component';

describe('GetNodeDataFormComponent', () => {
  let component: GetNodeDataFormComponent;
  let fixture: ComponentFixture<GetNodeDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetNodeDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetNodeDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
