import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  prefix = 'aquapp_';
  constructor() {}

  save(name: string, value: string) {
    localStorage.setItem(this.prefix + name, value);
  }

  get(name: string): string {
    return localStorage.getItem(this.prefix + name);
  }

  unset(name: string) {
    localStorage.removeItem(this.prefix + name);
  }
}
