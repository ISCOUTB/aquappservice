import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcampffControlComponent } from './icampff-control.component';

describe('IcampffControlComponent', () => {
  let component: IcampffControlComponent;
  let fixture: ComponentFixture<IcampffControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcampffControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcampffControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
