import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '../translate/translate.service';
import { TranslatePipe } from '../translate/translate.pipe';
import { ExportComponent } from './export.component';
import { MatIconModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatCheckboxModule, MatSelectModule, MatRadioButton, MatRadioModule, MatProgressSpinnerModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportComponent, TranslatePipe ],
      imports: [
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatRadioModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [
        TranslateService
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
