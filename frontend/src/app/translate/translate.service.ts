import { Injectable } from '@angular/core';
import { TRANSLATIONS } from './TRANSLATIONS';

@Injectable({
  providedIn: 'root'
})
/**
 * This service translate text and switches the
 * applicaiton language using a list of translations.
 */
export class TranslateService {
  private currentLanguage: string = 'es';
  
  constructor() { }

  translate(text: string): string {
    var result: any = TRANSLATIONS.filter(txt => txt['en'] === text);
    return (result.length > 0)? result[0][this.currentLanguage] : text;
  }

  selectLanguage(language: string) {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
}
