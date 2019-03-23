import { Component, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Router, RoutesRecognized } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
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
      transition('void <=> *', animate(225))
    ])
  ]
})
export class NavigationComponent implements OnInit {
  opened = false;
  blackList = ['/', '/vista-general'];
  url: string;
  constructor(private router: Router, public location: Location) {
    this.router.events.subscribe(event => {
      if (event instanceof RoutesRecognized) {
        this.url = event.url;
      }
    });
  }

  ngOnInit() {}

  home() {
    this.router.navigate(['/']);
  }
}
