import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeAdminDashboardComponent } from './users.component';

describe('MeAdminDashboardComponent', () => {
  let component: MeAdminDashboardComponent;
  let fixture: ComponentFixture<MeAdminDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeAdminDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
