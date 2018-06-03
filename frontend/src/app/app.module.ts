import './polyfills';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CdkTableModule} from '@angular/cdk/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatAutocompleteModule,
  MAT_DATE_LOCALE,
  MatIconRegistry,
  MatFormFieldModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule, 
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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ExportComponent,
    Dialog,
    AboutComponent,
    NSDialog,
    TranslatePipe
  ],
  entryComponents: [Dialog, ExportComponent, NSDialog, HomeComponent],
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
  }
 }
