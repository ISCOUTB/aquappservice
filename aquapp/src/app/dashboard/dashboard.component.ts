import { Component, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0', height: 0 }),
        animate('0.5s ease-out', style({ opacity: '1', height: '*' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  cols = 1;
  constructor() {
    this.cols = window.innerWidth < 768 ? 1 : window.innerWidth < 1140 ? 2 : 3;
    window.onresize = () => {
      this.cols =
        window.innerWidth < 768 ? 1 : window.innerWidth < 1140 ? 2 : 3;
    };
  }

  ngOnInit() {}
}
