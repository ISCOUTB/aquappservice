import { Component, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
          height: '0px',
          display: 'none'
        })
      ),
      transition('void <=> *', animate(225))
    ])
  ]
})
export class AboutComponent implements OnInit {
  breakpoint: number; // Number of columns to display in the mat-grid-lists
  sidenavOpened = false;
  constructor(private activatedRoute: ActivatedRoute) {
    this.breakpoint =
      window.innerWidth <= 743 ? 1 : window.innerWidth >= 1000 ? 3 : 2;
    window.onresize = () => {
      this.breakpoint =
        window.innerWidth <= 743 ? 1 : window.innerWidth >= 1000 ? 3 : 2;
    };
  }

  ngOnInit() {
    this.activatedRoute.fragment.subscribe(f => {
      const element = document.querySelector('#' + f);
      if (element) {
        element.scrollIntoView();
      }
    });
  }
}
