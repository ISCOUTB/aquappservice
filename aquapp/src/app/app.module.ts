import { DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './modules/utils/routing/app-routing.module';
import { AppComponent } from './app.component';
import {
  MatIconRegistry,
  MatTooltipModule,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule
} from '@angular/material';

import { AdminModule } from './modules/admin/admin.module';
import { AquappModule } from './modules/aquapp/aquapp.module';
import { NavigationComponent } from './modules/admin/components/navigation/navigation.component';
import { HeaderComponent } from './modules/aquapp/components/header/header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslationModule } from './modules/utils/translation/translation.module';
import { CordovaModule } from './modules/utils/cordova/cordova.module';
import { NotFoundComponent } from './components/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    HeaderComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    AdminModule,
    AquappModule,
    RouterModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    TranslationModule,
    CordovaModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
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
      'view_quilt',
      'expand_less',
      'expand_more',
      'layers',
      'layers_clear',
      'pin_drop',
      'settings'
    ]) {
      iconRegistry.addSvgIcon(
        icon,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/${icon}.svg`)
      );
    }
  }
}
