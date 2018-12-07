import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '../translate/translate.service';
import { TranslatePipe } from '../translate/translate.pipe';

import { NotfoundComponent } from './notfound.component';
import { MatIconModule } from '@angular/material';

describe('NotfoundComponent', () => {
  let component: NotfoundComponent;
  let fixture: ComponentFixture<NotfoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotfoundComponent, TranslatePipe ],
      imports: [
        MatIconModule
      ],
      providers: [
        TranslateService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
