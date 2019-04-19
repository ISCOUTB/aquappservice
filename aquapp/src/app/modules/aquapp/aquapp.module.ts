import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatGridListModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSidenavModule,
  MatListModule,
  MatDividerModule,
  MatButtonToggleModule,
  MatMenuModule
} from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { AquAppComponent } from './components/home/aquapp.component';
import { ExportDataFormComponent } from '../admin/components/forms/export-data/export-data.component';
import { ExportDataResultComponent } from './components/export-data-result/export-data-result.component';
import { AboutComponent } from './components/about/about.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { TranslationModule } from '../utils/translation/translation.module';
import { NgxDygraphsModule } from 'ngx-dygraphs';
import { RouterModule } from '@angular/router';
import { CordovaModule } from '../utils/cordova/cordova.module';
import { PluginComponentModule } from '../utils/plugin-component/plugin-component.module';
import { IcampffLegendComponent } from './layers/icampff/legend/icampff-legend.component';
import { IcampffControlComponent } from './layers/icampff/controls/icampff-control.component';
import { WaterQualityControlComponent } from './layers/water-quality/controls/water-quality-control.component';
import { WaterQualityLegendComponent } from './layers/water-quality/legend/water-quality-legend.component';
import { WeatherStationControlComponent } from './layers/weather-station/controls/weather-station-control.component';
import { WeatherStationLegendComponent } from './layers/weather-station/legend/weather-station-legend.component';
import { HydroMFControlComponent } from './layers/hydro-metereologic-factors/controls/hydro-metereologic-factors-control.component';
import { HydroMFLegendComponent } from './layers/hydro-metereologic-factors/legend/hydro-metereologic-factors-legend.component';
import { StorageModule } from '../utils/storage/storage.module';

@NgModule({
  declarations: [
    AquAppComponent,
    ExportDataFormComponent,
    ExportDataResultComponent,
    AboutComponent,
    IcampffLegendComponent,
    IcampffControlComponent,
    WaterQualityControlComponent,
    WaterQualityLegendComponent,
    WeatherStationControlComponent,
    WeatherStationLegendComponent,
    HydroMFControlComponent,
    HydroMFLegendComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot(),
    NgxDygraphsModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    HttpClientModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatGridListModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatMenuModule,
    TranslationModule,
    RouterModule,
    CordovaModule,
    PluginComponentModule,
    StorageModule
  ],
  entryComponents: [
    IcampffControlComponent,
    IcampffLegendComponent,
    WaterQualityControlComponent,
    WaterQualityLegendComponent,
    WeatherStationControlComponent,
    WeatherStationLegendComponent,
    HydroMFControlComponent,
    HydroMFLegendComponent
  ]
})
export class AquappModule {}
