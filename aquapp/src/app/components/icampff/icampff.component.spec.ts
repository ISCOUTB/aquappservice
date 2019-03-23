import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcampffComponent } from './icampff.component';

describe('IcampffComponent', () => {
  let component: IcampffComponent;
  let fixture: ComponentFixture<IcampffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcampffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcampffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
