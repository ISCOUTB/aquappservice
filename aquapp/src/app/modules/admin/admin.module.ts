import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterBodiesComponent } from './components/water-bodies/water-bodies.component';
import { NodesComponent } from './components/nodes/nodes.component';
import { NodeTypesComponent } from './components/node-types/node-types.component';
import { SensorsComponent } from './components/sensors/sensors.component';
import { NodeDataComponent } from './components/node-data/node-data.component';
import { IcampffComponent } from './components/icampff/icampff.component';
import { LoginComponent } from './components/forms/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SeedComponent } from './components/seed/seed.component';
import { GetNodeDataFormComponent } from 'src/app/modules/admin/components/forms/get-node-data-form/get-node-data-form.component';
import { GetLatLngComponent } from 'src/app/modules/admin/components/forms/get-lat-lng/get-lat-lng.component';
import { WaterBodyNodesComponent } from './components/water-body-nodes/water-body-nodes.component';
import { EditWaterBodyDiagComponent } from 'src/app/modules/admin/components/forms/edit-water-body-dialog/edit-water-body-dialog.component';
import { EditWaterBodyPageComponent } from 'src/app/modules/admin/components/forms/edit-water-body-page/edit-water-body-page.component';
import { UsersComponent } from './components/users/users.component';
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
  MatMenuModule,
} from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { FileUploadComponent } from 'src/app/modules/admin/components/utils/fileupload/fileupload.component';
import { TranslationModule } from '../utils/translation/translation.module';
import { EditNodeFormComponent } from './components/forms/edit-node/edit-node.component';
import { RouterModule } from '@angular/router';
import { CordovaModule } from '../utils/cordova/cordova.module';
import { StorageModule } from '../utils/storage/storage.module';
import { MessageModule } from '../utils/message/message.module';

@NgModule({
  declarations: [
    WaterBodiesComponent,
    NodesComponent,
    NodeTypesComponent,
    SensorsComponent,
    NodeDataComponent,
    IcampffComponent,
    LoginComponent,
    DashboardComponent,
    SeedComponent,
    GetNodeDataFormComponent,
    GetLatLngComponent,
    WaterBodyNodesComponent,
    EditWaterBodyDiagComponent,
    EditWaterBodyPageComponent,
    UsersComponent,
    FileUploadComponent,
    EditNodeFormComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot(),
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
    StorageModule,
    MessageModule
  ]
})
export class AdminModule {}
