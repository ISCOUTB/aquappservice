import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css']
})
export class NotfoundComponent implements OnInit {
  screenWidth: number;  // The width (in pixels) of the window
  
  constructor() { 
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
  
    // set screenWidth on screen size change and fixes the map size
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
  }

  ngOnInit() {
  }

}
