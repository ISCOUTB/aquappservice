import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService } from '../translate/translate.service';
import { AboutComponent } from './about.component';
import { MatMenuModule, MatToolbarModule, MatCardModule, MatGridListModule, MatTableModule, MatTabGroup, MatTab, MatTabHeader, MatTabBody } from '@angular/material';
import { TranslatePipe } from '../translate/translate.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutComponent, 
        TranslatePipe,
        MatTabGroup,
        MatTab,
        MatTabHeader,
        MatTabBody 
      ],
      imports : [ MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatCardModule,
        MatGridListModule,
        MatTableModule,
        RouterTestingModule,
        CommonModule
      ],
      providers : [ TranslateService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
