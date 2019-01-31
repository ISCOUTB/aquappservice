import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeDataComponent } from './node-data.component';

describe('NodeDataComponent', () => {
  let component: NodeDataComponent;
  let fixture: ComponentFixture<NodeDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
