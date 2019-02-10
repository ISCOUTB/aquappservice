import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './translate.service';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  transform(value: any, args?: any): any {
    if (args && value !== 'Latest available' && args.type === 'date') {
      const date = new Date(value);
      return `${date.getDate() + 1}-${this.translateService.translate(
        args.fullDate
          ? this.monthNames[date.getMonth()]
          : this.monthNames[date.getMonth()].slice(0, 3)
      )}-${date.getFullYear()}`;
    }
    return this.translateService.translate(value);
  }
}
