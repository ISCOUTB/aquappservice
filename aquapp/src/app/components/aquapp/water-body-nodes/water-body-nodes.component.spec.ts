import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterBodyNodesComponent } from './water-body-nodes.component';

describe('WaterBodyNodesComponent', () => {
  let component: WaterBodyNodesComponent;
  let fixture: ComponentFixture<WaterBodyNodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterBodyNodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterBodyNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
