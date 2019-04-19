import { Injectable } from '@angular/core';
import { TRANSLATIONS } from './TRANSLATIONS';
import { StorageService } from '../../../../../services/storage/storage.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * This service translate text and switches the
 * applicaiton language using a list of translations.
 */
export class TranslateService {
  private currentLanguage = 'es';

  // Observable string source
  private reloadSource = new Subject<string>();
  // Observable string stream
  reload$ = this.reloadSource.asObservable();

  constructor(private storageService: StorageService) {
    this.currentLanguage = this.storageService.get('language') || this.currentLanguage;
  }

  translate(text: string): string {
    const result: any = TRANSLATIONS.filter(txt => txt['en'] === text);
    return result.length > 0 ? result[0][this.currentLanguage] : text;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
    this.storageService.save('language', this.getCurrentLanguage());
  }

  // Service message commands
  reload(rmessage: string) {
    this.reloadSource.next(rmessage);
  }
}
