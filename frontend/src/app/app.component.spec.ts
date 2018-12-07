import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MatIconModule, MatMenuModule, MatToolbarModule, MatCardModule, MatGridListModule, MatTableModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports : [ MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatCardModule,
        MatGridListModule,
        MatTableModule,
        RouterTestingModule,
        CommonModule
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('AquApp');
  }));

});
