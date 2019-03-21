import { Component } from '@angular/core';
import { TranslateService } from './translate/translate.service';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'aquapp';

  constructor(
    private translateService: TranslateService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (environment.production) {
          (<any>window).ga('set', 'page', event.urlAfterRedirects);
          (<any>window).ga('send', 'pageview');
        }
      }
    });
  }

  reloadFiguresInOverview() {
    this.translateService.reload('reload');
  }
}
