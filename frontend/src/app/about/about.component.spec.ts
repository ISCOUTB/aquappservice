import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService } from '../translate/translate.service';
import { AboutComponent } from './about.component';
import { MatMenuModule, MatToolbarModule, MatCardModule, MatGridListModule, MatTableModule, MatTabGroup, MatTab, MatTabHeader, MatTabBody, MatNativeDateModule, MatDatepickerModule, MatSelectModule, MatInputModule, MatFormFieldModule, MatSnackBarModule, MatDialogModule, MatDividerModule, MatTabsModule } from '@angular/material';
import { TranslatePipe } from '../translate/translate.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 
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
      imports : [
        BrowserAnimationsModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatCardModule,
        MatGridListModule,
        MatTableModule,
        MatDividerModule,
        MatDialogModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
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
