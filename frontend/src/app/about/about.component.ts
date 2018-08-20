import { Component, OnInit } from '@angular/core';
import { TranslateService } from '../translate/translate.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  labels = 4  // Number of labels in the mat-tab
  breakpoint: number;  // Number of columns to display in the mat-grid-lists
  screenWidth: number;  // Width of the window
  
  /**
   * For the swipe behavior in the mat-tabs
   * Selected index is the currently selected tab in
   * the mat-tab-group
   */
  selectedIndex = 0;
  selectedLanguage: string;
  
  /**
   * 
   * @param translateService The translate service is being used here
   * to change the language of the app
   */
  constructor(private translateService: TranslateService) { 
    this.breakpoint = (window.innerWidth <= 743)? 1:((window.innerWidth >= 1000)? 3:2);
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.breakpoint = (window.innerWidth <= 743)? 1:((window.innerWidth >= 1000)? 3:2);
      this.screenWidth = window.innerWidth;
    }
    this.selectedLanguage = this.translateService.getCurrentLanguage() != "en" ? "English":"Español";
  }

  ngOnInit() {
    
  }

  toggleLanguage() {
    this.translateService.selectLanguage(this.translateService.getCurrentLanguage() == "en"? "es":"en");
    this.selectedLanguage = this.translateService.getCurrentLanguage() != "en" ? "English":"Español";
  }

  // Moves one tab to the left or the right depending on the swipe direction
  /*swipe(idx, event) {
    const steps = 1
    if (event.type === 'swipeleft') {
      const isLast = this.selectedIndex + steps >= this.labels - 1;
      this.selectedIndex = isLast ? this.labels - 1 : this.selectedIndex + steps;
    }

    if (event.type === 'swiperight') {
      const isFirst = this.selectedIndex - steps <= 0;
      this.selectedIndex = isFirst ? 0 : this.selectedIndex - steps;
    }
    console.log(this.selectedIndex);
  }*/
}
