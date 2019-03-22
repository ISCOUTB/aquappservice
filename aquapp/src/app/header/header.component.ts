import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { ApiService } from '../api/api.service';
import { Location } from '@angular/common';
import { MessageService } from '../message/message.service';
import { TranslateService } from '../translate/translate.service';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { CordovaService } from '../cordova/cordova.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
          width: '0px',
          display: 'none'
        })
      ),
      transition('void <=> *', animate(500))
    ])
  ]
})
export class HeaderComponent implements OnInit {
  page = '';
  pageFull = '';
  menuExpanded = false;
  // Routes that doesn't require to be logged in (so, the logout button has to be)
  // hidden
  freeRoutes = [
    '/',
    '/vista-general',
    '/404',
    '/acerca-de',
    '/formulario-exportar-datos',
    '/resultado-exportar-datos'
  ];
  selectedLanguage: string;

  // Routes in which the header has to be hidden
  noHeaderRoutes = ['/inicio-de-sesion'];

  url: string;

  @Output()
  reloadFiguresInOverview: EventEmitter<any> = new EventEmitter();
  constructor(
    public router: Router,
    private apiService: ApiService,
    private location: Location,
    private messageService: MessageService,
    public translateService: TranslateService,
    public cordovaService: CordovaService
  ) {
    this.selectedLanguage =
      this.translateService.getCurrentLanguage() === 'es'
        ? 'English'
        : 'Español';
    this.router.events.subscribe(event => {
      if (event instanceof RoutesRecognized) {
        this.url = event.url.indexOf('#') !== -1 ? event.url.split('#')[0] : event.url.split('?')[0];
        try {
          this.pageFull = event.state.root.children[0].data['title'];
          this.page =
            event.state.root.children[0].data['title'].length > 24 &&
            window.innerWidth < 380
              ? event.state.root.children[0].data['title'].slice(0, 24) + '...'
              : event.state.root.children[0].data['title'];
        } catch (error) {
          this.page = '';
        }
      }
    });
  }

  ngOnInit() {}

  confirmLogOut() {
    this.messageService.show(
      '¿Seguro que desea cerrar sesión?',
      'Sí',
      this,
      'logOut'
    );
  }

  logOut() {
    this.apiService.logOut();
  }

  toggleLanguage() {
    this.translateService.toggleLanguage();
    this.selectedLanguage =
      this.translateService.getCurrentLanguage() === 'es'
        ? 'English'
        : 'Español';
    if (this.router.url.split('?')[0] === '/vista-general') {
      this.reloadFiguresInOverview.emit();
    }
  }
}
