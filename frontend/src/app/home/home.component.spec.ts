import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '../translate/translate.service';
import { TranslatePipe } from '../translate/translate.pipe';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { HomeComponent } from './home.component';
import { MatIconModule, MatMenuModule, MatToolbarModule, MatCardModule, MatGridListModule, MatTableModule, MatDividerModule, MatDialogModule, MatSnackBarModule } from '@angular/material';


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent, TranslatePipe ],
      imports: [
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatCardModule,
        MatGridListModule,
        MatTableModule,
        MatDividerModule,
        MatDialogModule,
        MatSnackBarModule
      ],
      providers:[
        TranslateService, HttpClient, HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
