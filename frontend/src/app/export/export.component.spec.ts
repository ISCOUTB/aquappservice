import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '../translate/translate.service';
import { TranslatePipe } from '../translate/translate.pipe';
import { ExportComponent } from './export.component';
import { MatIconModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatCheckboxModule, MatSelectModule, MatRadioButton, MatRadioModule, MatProgressSpinnerModule, MatSnackBarModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AcronymPipe } from '../utils/acronym.pipe';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportComponent, TranslatePipe, AcronymPipe ],
      imports: [
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatRadioModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [
        TranslateService, HttpClient, HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
