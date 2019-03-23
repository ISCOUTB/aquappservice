import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TranslateService } from './services/translate/translate.service';
import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'aquapp';

  navigationClass = 'navigation';

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
        this.navigationClass =
          event.url === '/inicio-de-sesion'
            ? 'navigation-top'
            : 'navigation-top-with-offset';
      }
    });
  }

  reloadFiguresInOverview() {
    this.translateService.reload('reload');
  }
}
