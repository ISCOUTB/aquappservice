import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TranslatePipe } from '../translate/translate.pipe';
import { MatTabsModule, MatIconModule } from '@angular/material';
import { TranslateService } from '../translate/translate.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent, TranslatePipe],
      imports: [ MatTabsModule,
        BrowserAnimationsModule,
        MatIconModule
      ],

      providers:[
        TranslateService
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
