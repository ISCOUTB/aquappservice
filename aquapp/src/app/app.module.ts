import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatIconRegistry,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatGridListModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MAT_DATE_LOCALE,
  MatDatepickerModule,
  MatNativeDateModule,
  MatMenuModule,
  MatSidenavModule,
  MatListModule,
  MatDividerModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/forms/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OverviewComponent } from './components/overview/overview.component';
import { HeaderComponent } from './components/header/header.component';
import { WaterBodiesComponent } from './components/water-bodies/water-bodies.component';
import { NodesComponent } from './components/nodes/nodes.component';
import { NodeTypesComponent } from './components/node-types/node-types.component';
import { SensorsComponent } from './components/sensors/sensors.component';
import { NodeDataComponent } from './components/node-data/node-data.component';
import { IcampffComponent } from './components/icampff/icampff.component';
import { HttpClientModule } from '@angular/common/http';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SeedComponent } from './components/seed/seed.component';
import { GetNodeDataFormComponent } from './components/forms/get-node-data-form/get-node-data-form.component';
import { GetLatLngComponent } from './components/forms/get-lat-lng/get-lat-lng.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { WaterBodyNodesComponent } from './components/water-body-nodes/water-body-nodes.component';
import { EditWaterBodyDialogComponent } from './components/forms/edit-water-body-dialog/edit-water-body-dialog.component';
import { EditWaterBodyPageComponent } from './components/forms/edit-water-body-page/edit-water-body-page.component';
import { FileUploadComponent } from './components/fileupload/fileupload.component';
import { EditNodeFormComponent } from './components/forms/edit-node/edit-node.component';
import { ExportDataFormComponent } from './components/forms/export-data/export-data.component';
import { ExportDataResultComponent } from './components/export-data-result/export-data-result.component';
import { NgxDygraphsModule } from 'ngx-dygraphs';
import { AboutComponent } from './components/about/about.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { UsersComponent } from './components/users/users.component';

import { CordovaService } from './services/cordova/cordova.service';
import { TranslatePipe } from './services/translate/translate.pipe';
import { TranslateService } from './services/translate/translate.service';
import { IcampffLeyendComponent } from './layers/icampff/leyend/icampff-leyend.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    OverviewComponent,
    HeaderComponent,
    WaterBodiesComponent,
    NodesComponent,
    NodeTypesComponent,
    SensorsComponent,
    NodeDataComponent,
    IcampffComponent,
    NotFoundComponent,
    SeedComponent,
    GetNodeDataFormComponent,
    GetLatLngComponent,
    WaterBodyNodesComponent,
    EditWaterBodyDialogComponent,
    EditWaterBodyPageComponent,
    FileUploadComponent,
    EditNodeFormComponent,
    ExportDataFormComponent,
    ExportDataResultComponent,
    TranslatePipe,
    AboutComponent,
    NavigationComponent,
    UsersComponent,
    IcampffLeyendComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot(),
    MatMenuModule,
    NgxDygraphsModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-GB' },
    TranslateService,
    TranslatePipe,
    CordovaService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    for (const icon of [
      'add',
      'background',
      'cache',
      'calendar',
      'call_made',
      'call_received',
      'center_focus_strong',
      'check',
      'close',
      'cool',
      'cross-browser',
      'data',
      'data2',
      'download',
      'edit',
      'exit_to_app',
      'filter',
      'help',
      'home',
      'how_to_vote',
      'more_horiz',
      'more_vert',
      'navigate_before',
      'navigate_next',
      'node',
      'people',
      'refresh',
      'remove',
      'save_alt',
      'sensor',
      'timeline',
      'unchained',
      'view_quilt'
    ]) {
      iconRegistry.addSvgIcon(
        icon,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/${icon}.svg`)
      );
    }
  }
}
