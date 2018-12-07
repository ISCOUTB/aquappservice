import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TranslatePipe } from '../translate/translate.pipe';
import { MatTabsModule, MatIconModule, MatMenuModule, MatToolbarModule, MatCardModule, MatGridListModule, MatTableModule, MatDividerModule, MatDialogModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatNativeDateModule, MatDatepickerModule } from '@angular/material';
import { TranslateService } from '../translate/translate.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';



describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent, TranslatePipe],
      imports: [ MatTabsModule,
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

      providers:[
        TranslateService, HttpClient, HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
