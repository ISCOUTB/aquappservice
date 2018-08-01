import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../translate/translate.service';

@Pipe({
  name: 'acronym'
})
export class AcronymPipe implements PipeTransform {
  nodeTypes: any = {
    "59c9d9019a892016ca4be412": "Water Quality",
    "59c9d9019a892016ca4be413": "Hydro-Metereologic Factors",
    "5a16342a9a8920290056a542": "Weather Station"
  }

  constructor(private translateService: TranslateService) { }

  transform(value: any, args?: any): any {
    var acronym: string[] = this.translateService.translate(this.nodeTypes[value]).toUpperCase().split(' ');
    if (acronym.length == 3)
      return acronym[0][0] + acronym[2][0];
    return acronym[0][0] + acronym[1][0];
  }

}
