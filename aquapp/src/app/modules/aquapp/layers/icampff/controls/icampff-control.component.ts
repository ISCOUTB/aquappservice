import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-icampff-control',
  templateUrl: './icampff-control.component.html',
  styleUrls: ['./icampff-control.component.scss']
})
export class IcampffControlComponent implements OnInit {
  @Input() icamDates: Date[];
  @Output() removeWaterBodies = new EventEmitter();
  @Output() addWaterBodies = new EventEmitter();
  selectedDate: string;
  constructor() {}

  ngOnInit() {}

  selectDate(date: Date | string) {
    this.removeWaterBodies.emit('');
    if (date === 'Latest available') {
      this.addWaterBodies.emit('Latest available');
      this.selectedDate = 'Latest available';
    } else {
      this.addWaterBodies.emit(date.toString());
      this.selectedDate = new Date(date).toDateString();
    }
  }
}
