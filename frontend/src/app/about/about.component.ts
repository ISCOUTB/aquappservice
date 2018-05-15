import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  breakpoint: number;
  constructor() { 

  }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 743)? 1:((window.innerWidth >= 1000)? 3:2);
    window.onresize = () => {
      this.breakpoint = (window.innerWidth <= 743)? 1:((window.innerWidth >= 1000)? 3:2);
      console.log(window.innerWidth);
    }
  }

}
