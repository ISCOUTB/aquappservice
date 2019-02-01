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
  MatGridListModule
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
import { HttpClientModule } from '@angular/common/http';
import { NotFoundComponent } from './not-found/not-found.component';

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
    NotFoundComponent
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
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'add',
        sanitizer.bypassSecurityTrustResourceUrl('assets/add.svg')
    );
    iconRegistry.addSvgIcon(
        'close',
        sanitizer.bypassSecurityTrustResourceUrl('assets/close.svg')
    );
    iconRegistry.addSvgIcon(
        'exit_to_app',
        sanitizer.bypassSecurityTrustResourceUrl('assets/exit_to_app.svg')
    );
    iconRegistry.addSvgIcon(
        'home',
        sanitizer.bypassSecurityTrustResourceUrl('assets/home.svg')
    );
    iconRegistry.addSvgIcon(
        'how_to_vote',
        sanitizer.bypassSecurityTrustResourceUrl('assets/how_to_vote.svg')
    );
    iconRegistry.addSvgIcon(
        'more_horiz',
        sanitizer.bypassSecurityTrustResourceUrl('assets/more_horiz.svg')
    );
    iconRegistry.addSvgIcon(
        'navigate_before',
        sanitizer.bypassSecurityTrustResourceUrl(
            'assets/navigate_before.svg'
        )
    );
    iconRegistry.addSvgIcon(
        'navigate_next',
        sanitizer.bypassSecurityTrustResourceUrl('assets/navigate_next.svg')
    );
    iconRegistry.addSvgIcon(
        'people',
        sanitizer.bypassSecurityTrustResourceUrl('assets/people.svg')
    );
    iconRegistry.addSvgIcon(
        'refresh',
        sanitizer.bypassSecurityTrustResourceUrl('assets/refresh.svg')
    );
    iconRegistry.addSvgIcon(
        'view_quilt',
        sanitizer.bypassSecurityTrustResourceUrl('assets/view_quilt.svg')
    );
    iconRegistry.addSvgIcon(
        'remove',
        sanitizer.bypassSecurityTrustResourceUrl('assets/remove.svg')
    );
    iconRegistry.addSvgIcon(
        'center_focus_strong',
        sanitizer.bypassSecurityTrustResourceUrl(
            'assets/center_focus_strong.svg'
        )
    );
    iconRegistry.addSvgIcon(
        'call_received',
        sanitizer.bypassSecurityTrustResourceUrl('assets/call_received.svg')
    );
    iconRegistry.addSvgIcon(
        'call_made',
        sanitizer.bypassSecurityTrustResourceUrl('assets/call_made.svg')
    );
    iconRegistry.addSvgIcon(
        'edit',
        sanitizer.bypassSecurityTrustResourceUrl('assets/edit.svg')
    );
    iconRegistry.addSvgIcon(
        'check',
        sanitizer.bypassSecurityTrustResourceUrl('assets/check.svg')
    );
    iconRegistry.addSvgIcon(
        'timeline',
        sanitizer.bypassSecurityTrustResourceUrl('assets/timeline.svg')
    );
    iconRegistry.addSvgIcon(
        'save_alt',
        sanitizer.bypassSecurityTrustResourceUrl('assets/save_alt.svg')
    );
    iconRegistry.addSvgIcon(
        'help',
        sanitizer.bypassSecurityTrustResourceUrl('assets/help.svg')
    );
}
}
