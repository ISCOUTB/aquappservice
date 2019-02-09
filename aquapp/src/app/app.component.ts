import { Component } from '@angular/core';
import { TranslateService } from './translate/translate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'aquapp';

  constructor(private translateService: TranslateService) {}

  reloadFiguresInOverview() {
    this.translateService.reload('reload');
  }
}
