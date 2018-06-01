import { Injectable } from '@angular/core';
import { TRANSLATIONS } from './TRANSLATIONS';
import { filterQueryId } from '@angular/core/src/view/util';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private currentLanguage = 'es';
  
  constructor() { }

  translate(text: string): string {
    var result: any = TRANSLATIONS.filter(txt => txt['en'] === text);
    return (result.length > 0)? result[0][this.currentLanguage] : text;
  }

  selectLanguage(language: string) {
    this.currentLanguage = language;
  }
}
