import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { ApiService } from '../api/api.service';
import { Location } from '@angular/common';
import { MessageService } from '../message/message.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  page = '';
  pageFull = '';
  menuExpanded = false;
  // Routes that doesn't require to be logged in (so, the logout button has to be)
  // hidden
  freeRoutes = ['/vista-general', '/404', '/acerca-de'];

  // Routes in which the header has to be hidden
  noHeaderRoutes = ['/inicio-de-sesion'];
  constructor(
    public router: Router,
    private apiService: ApiService,
    private location: Location,
    private messageService: MessageService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof RoutesRecognized) {
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
}
