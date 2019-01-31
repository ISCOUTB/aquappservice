import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './overview/overview.component';
import { HeaderComponent } from './header/header.component';
import { WaterBodiesComponent } from './water-bodies/water-bodies.component';
import { NodesComponent } from './nodes/nodes.component';
import { NodeTypesComponent } from './node-types/node-types.component';
import { SensorsComponent } from './sensors/sensors.component';
import { NodeDataComponent } from './node-data/node-data.component';
import { IcampffComponent } from './icampff/icampff.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, DashboardComponent, OverviewComponent, HeaderComponent, WaterBodiesComponent, NodesComponent, NodeTypesComponent, SensorsComponent, NodeDataComponent, IcampffComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
