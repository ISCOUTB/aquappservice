import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { MessageService } from '../message/message.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  token: string;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private messageService: MessageService,
    private router: Router
  ) {}

  // AUTHENTICATION

  logOut() {
    this.storageService.unset('user');
    this.storageService.unset('token');
    this.router.navigateByUrl('/login');
  }

  login(user: string, password: string, redirectTo: string = '/dashboard') {
    if (user && password) {
      this.storageService.save('user', user);
    }
    this.http
      .post<{ token: string }>(
        this.apiUrl + 'users/login',
        {},
        {
          headers: {
            Authorization: 'Basic ' + btoa(user + ':' + password)
          }
        }
      )
      .subscribe(
        r => {
          this.token = r.token;
          this.storageService.save('token', r.token);
          this.messageService.show('Sesión iniciada');
          if (redirectTo) {
            this.router.navigateByUrl(redirectTo);
          }
        },
        err => {
          console.log(err);
          this.messageService.show(
            'Error al iniciar sesión, revise sus datos e intente de nuevo'
          );
        }
      );
  }
}
