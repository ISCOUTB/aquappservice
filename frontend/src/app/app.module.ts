import './polyfills';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MAT_DATE_LOCALE,
  MatIconRegistry,
  MatFormFieldModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatMenuModule} from '@angular/material';

import { AppComponent } from './app.component';
import { HomeComponent, Dialog as NSDialog } from './home/home.component';
import { ExportComponent, Dialog } from './export/export.component';
import { HttpClientModule } from '@angular/common/http';
import { NgDygraphsModule } from 'ng-dygraphs';
import { AppRoutingModule } from './/app-routing.module';
import { AboutComponent } from './about/about.component';
import { TranslatePipe } from './translate/translate.pipe';
import { TranslateService } from './translate/translate.service';
import { DashboardComponent, Dialog as DBDialog } from './dashboard/dashboard.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { AcronymPipe } from './utils/acronym.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ExportComponent,
    Dialog,
    AboutComponent,
    NSDialog,
    TranslatePipe,
    DBDialog,
    DashboardComponent,
    NotfoundComponent,
    AcronymPipe
  ],
  entryComponents: [Dialog, ExportComponent, NSDialog, HomeComponent, DBDialog, DashboardComponent],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatGridListModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NgDygraphsModule,
    MatSnackBarModule,
    MatTabsModule,
    MatGridListModule,
    MatDividerModule,
    HttpClientModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    AppRoutingModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    TranslateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'filter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/filter.svg'));
    iconRegistry.addSvgIcon(
      'three-bar-menu',
      sanitizer.bypassSecurityTrustResourceUrl('assets/three-bar-menu.svg'));
    iconRegistry.addSvgIcon(
      'questionmark',
      sanitizer.bypassSecurityTrustResourceUrl('assets/questionmark.svg'));
    iconRegistry.addSvgIcon(
      'dialog',
      sanitizer.bypassSecurityTrustResourceUrl('assets/dialog.svg'));
    iconRegistry.addSvgIcon(
      'road-closure',
      sanitizer.bypassSecurityTrustResourceUrl('assets/road-closure.svg'));
    iconRegistry.addSvgIcon(
      'authenticate',
      sanitizer.bypassSecurityTrustResourceUrl('assets/authenticate.svg'));
    iconRegistry.addSvgIcon(
      'calendar',
      sanitizer.bypassSecurityTrustResourceUrl('assets/calendar.svg'));
    iconRegistry.addSvgIcon(
      'download',
      sanitizer.bypassSecurityTrustResourceUrl('assets/download.svg'));
    iconRegistry.addSvgIcon(
      'data',
      sanitizer.bypassSecurityTrustResourceUrl('assets/data.svg'));
    iconRegistry.addSvgIcon(
      'unchained',
      sanitizer.bypassSecurityTrustResourceUrl('assets/unchained.svg'));
    iconRegistry.addSvgIcon(
      'cool',
      sanitizer.bypassSecurityTrustResourceUrl('assets/cool.svg'));
    iconRegistry.addSvgIcon(
      'cross-browser',
      sanitizer.bypassSecurityTrustResourceUrl('assets/cross-browser.svg'));
  }
}
