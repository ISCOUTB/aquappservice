import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { MessageService } from '../message/message.service';
import { Router } from '@angular/router';
import { Page } from '../models/page.model';
import { NodeType } from '../models/node-type.model';

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
  ) {
    if (!this.token && !this.storageService.get('token')) {
      this.logOut();
    }
    this.token = this.storageService.get('token');
  }

  // AUTHENTICATION

  logOut() {
    this.storageService.unset('user');
    this.storageService.unset('token');
    this.router.navigateByUrl('/inicio-de-sesion');
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

  getNodeTypesPage(name: string, pageIndex: number, pageSize: number) {
    return this.http.get<Page<NodeType[]>>(this.apiUrl + 'node-types', {
      params: {
        name: name,
        pageSize: pageSize.toString(),
        pageIndex: pageIndex.toString()
      },
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  newNodeType(name: string, separator: string) {
    return this.http.post(
      this.apiUrl + 'node-types',
      {
        name: name,
        separator: separator
      },
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  editNodeType(nodeType: NodeType) {
    return this.http.put(this.apiUrl + 'node-types', nodeType, {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  deleteNodeType(id: string) {
    return this.http.delete(this.apiUrl + 'node-types', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        id: id
      }
    });
  }

  getAllNodeTypes() {
    return this.http.get<NodeType[]>(this.apiUrl + 'node-types', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }
}
