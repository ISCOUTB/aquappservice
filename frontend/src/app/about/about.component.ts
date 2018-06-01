import { Component, OnInit } from '@angular/core';
import { TranslateService } from '../translate/translate.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  breakpoint: number;
  screenWidth: number;
  constructor(private translateService: TranslateService) { 
    this.breakpoint = (window.innerWidth <= 743)? 1:((window.innerWidth >= 1000)? 3:2);
    window.onresize = () => {
      this.breakpoint = (window.innerWidth <= 743)? 1:((window.innerWidth >= 1000)? 3:2);
      console.log(window.innerWidth);
      this.screenWidth = window.innerWidth;
    }
  }

  ngOnInit() {
    
  }

  selectLanguage(str) {
    return this.translateService.selectLanguage(str);
  }

}
