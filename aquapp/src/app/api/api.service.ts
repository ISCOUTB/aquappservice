import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { MessageService } from '../message/message.service';
import { Router } from '@angular/router';
import { Page } from '../models/page.model';
import { NodeType } from '../models/node-type.model';
import { Sensor } from '../models/sensor.model';
import { Node } from '../models/node.model';

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

  // NODE TYPES

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

  // SENSORS

  getSensorsPage(
    nodeTypeId: string,
    name: string,
    pageIndex: number,
    pageSize: number
  ) {
    return this.http.get<Page<Sensor[]>>(this.apiUrl + 'sensors', {
      params: {
        nodeTypeId: nodeTypeId,
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

  newSensor(nodeTypeId: string, variable: string, unit: string) {
    return this.http.post(
      this.apiUrl + 'sensors',
      {
        variable: variable,
        unit: unit,
        nodeTypeId: nodeTypeId
      },
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  editSensor(sensor: Sensor) {
    return this.http.put(this.apiUrl + 'sensors', sensor, {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  deleteSensor(id: string) {
    return this.http.delete(this.apiUrl + 'sensors', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        id: id
      }
    });
  }

  getAllSensors() {
    return this.http.get<Sensor[]>(this.apiUrl + 'sensors', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  // NODES

  getNodesPage(name: string, pageIndex: number, pageSize: number) {
    return this.http.get<Page<Node[]>>(this.apiUrl + 'nodes', {
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

  newNode(
    name: string,
    location: string,
    coordinates: number[],
    status: string,
    nodeTypeId: string,
    waterBodyId?: string
  ) {
    return this.http.post(
      this.apiUrl + 'nodes',
      {
        name: name,
        location: location,
        coordinates: coordinates,
        status: status,
        nodeTypeId: nodeTypeId,
        waterBodyId: waterBodyId
      },
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  editNode(sensor: Node) {
    return this.http.put(this.apiUrl + 'nodes', sensor, {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  deleteNode(id: string) {
    return this.http.delete(this.apiUrl + 'nodes', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        id: id
      }
    });
  }

  getAllNodes() {
    return this.http.get<Node[]>(this.apiUrl + 'nodes', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }
}
