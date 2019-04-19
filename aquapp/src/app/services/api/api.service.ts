import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../modules/utils/storage/services/storage/storage.service';
import { MessageService } from '../message/message.service';
import { Router, NavigationEnd } from '@angular/router';
import { Page } from 'src/app/models/page.model';
import { NodeType } from 'src/app/models/node-type.model';
import { Sensor } from 'src/app/models/sensor.model';
import { Node } from 'src/app/models/node.model';
import { Datum } from 'src/app/models/datum.model';
import { WaterBody } from 'src/app/modules/aquapp/models/water-body.model';
import { IcampffAvg } from 'src/app/modules/aquapp/models/icampff-avg.model';
import { filter } from 'rxjs/operators';
import { User } from 'src/app/modules/admin/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  token: string;
  freeRoutes = [
    '/',
    '/vista-general',
    '/404',
    '/acerca-de',
    '/formulario-exportar-datos',
    '/resultado-exportar-datos'
  ];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((navEnd: NavigationEnd) => {
        if (!this.token && !this.storageService.get('token')) {
          if (this.router.url.indexOf('#') !== -1) {
            if (this.freeRoutes.indexOf(this.router.url.split('#')[0]) === -1) {
              console.log('logging out');
              this.logOut();
            }
          } else {
            if (this.freeRoutes.indexOf(this.router.url.split('?')[0]) === -1) {
              console.log('logging out');
              this.logOut();
            }
          }
        }
        this.token = this.storageService.get('token');
      });
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

  newNodeType(name: string, separator: string, id?: string) {
    return this.http.post(
      this.apiUrl + 'node-types',
      id
        ? {
            id: id,
            name: name,
            separator: separator
          }
        : {
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

  getAllSensors(nodeTypeId: string) {
    return this.http.get<Sensor[]>(this.apiUrl + 'sensors', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        nodeTypeId: nodeTypeId
      }
    });
  }

  // NODES

  getNodesPage(
    name: string,
    pageIndex: number,
    pageSize: number,
    waterBodyId: string = '',
    nodeTypeId: string = ''
  ) {
    return this.http.get<Page<Node[]>>(this.apiUrl + 'nodes', {
      params:
        pageIndex || pageSize
          ? {
              name: name,
              pageSize: pageSize.toString(),
              pageIndex: pageIndex.toString(),
              waterBodyId: waterBodyId,
              nodeTypeId: nodeTypeId
            }
          : {
              name: name,
              waterBodyId: waterBodyId,
              nodeTypeId: nodeTypeId
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
    id?: string
  ) {
    return this.http.post(
      this.apiUrl + 'nodes',
      id
        ? {
            id: id,
            name: name,
            location: location,
            coordinates: coordinates,
            status: status,
            nodeTypeId: nodeTypeId,
          }
        : {
            name: name,
            location: location,
            coordinates: coordinates,
            status: status,
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

  editNode(node: Node) {
    return this.http.put(this.apiUrl + 'nodes', node, {
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

  getAllNodes(nodeTypeId = '') {
    return this.http.get<Page<Node[]>>(this.apiUrl + 'nodes', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        nodeTypeId: nodeTypeId
      }
    });
  }

  // SEED

  loadSeeds() {
    return this.http.get(this.apiUrl + 'seed-node-data', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  // Node data

  getDataPage(
    nodeId: string,
    pageIndex: number,
    pageSize: number,
    variable: string,
    start: string = '',
    end: string = ''
  ) {
    return this.http.get<Page<Datum[]>>(this.apiUrl + 'data', {
      params:
        start && end
          ? {
              nodeId: nodeId,
              pageSize: pageSize.toString(),
              pageIndex: pageIndex.toString(),
              variable: variable,
              start: start,
              end: end
            }
          : start
          ? {
              nodeId: nodeId,
              pageSize: pageSize.toString(),
              pageIndex: pageIndex.toString(),
              variable: variable,
              start: start
            }
          : end
          ? {
              nodeId: nodeId,
              pageSize: pageSize.toString(),
              pageIndex: pageIndex.toString(),
              variable: variable,
              end: end
            }
          : {
              nodeId: nodeId,
              pageSize: pageSize.toString(),
              pageIndex: pageIndex.toString(),
              variable: variable
            },
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  newDatum(date: Date, variable: string, nodeId: string, value: any) {
    return this.http.post(
      this.apiUrl + 'data',
      {
        date: date.toISOString(),
        value: value
      },
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        },
        params: {
          nodeId: nodeId,
          variable: variable
        }
      }
    );
  }

  editDatum(datum: Datum, id: string, date: string, variable: string) {
    return this.http.put(this.apiUrl + 'data', datum, {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        id: id,
        date: date,
        variable: variable
      }
    });
  }

  deleteDatum(nodeId: string, variable: string, date: string) {
    return this.http.delete(this.apiUrl + 'data', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        nodeId: nodeId,
        variable: variable,
        date: date
      }
    });
  }

  getAllData() {
    return this.http.get<Datum[]>(this.apiUrl + 'data', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  // Water bodies
  getWaterBodiesPage(pageIndex: number, pageSize: number) {
    return this.http.get<Page<WaterBody[]>>(this.apiUrl + 'water-bodies', {
      params: {
        pageSize: pageSize.toString(),
        pageIndex: pageIndex.toString()
      },
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  newWaterBody(name: string, geojson: string) {
    return this.http.post(
      this.apiUrl + 'water-bodies',
      {
        name: name,
        geojson: geojson
      },
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  editWaterBody(waterBody: WaterBody) {
    return this.http.put(this.apiUrl + 'water-bodies', waterBody, {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  deleteWaterBody(id: string) {
    return this.http.delete(this.apiUrl + 'water-bodies', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        id: id
      }
    });
  }

  getAllWaterBodies() {
    return this.http.get<WaterBody[]>(this.apiUrl + 'water-bodies', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  getAWaterBody(id: string) {
    return this.http.get<WaterBody>(this.apiUrl + 'water-bodies', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        id: id
      }
    });
  }

  // ICAMPFF

  getIcampffPage(waterBodyId: string, pageIndex: number, pageSize: number) {
    return this.http.get<Page<IcampffAvg[]>>(
      this.apiUrl + 'icampff-avg-caches',
      {
        params: {
          waterBodyId: waterBodyId,
          pageSize: pageSize.toString(),
          pageIndex: pageIndex.toString()
        },
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  newIcampff(date: Date, values: number[], nodeId: string) {
    return this.http.post(
      this.apiUrl + 'icampff',
      {
        date: date.toISOString(),
        values: values,
        nodeId: nodeId
      },
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  deleteIcampff(waterBodyId: string, date: string) {
    return this.http.delete(this.apiUrl + 'icampff', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        waterBodyId: waterBodyId,
        date: date
      }
    });
  }

  getAllIcampff(waterBodyId: string) {
    return this.http.get<IcampffAvg[]>(this.apiUrl + 'icampff-avg-caches', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        waterBodyId: waterBodyId
      }
    });
  }

  buildIcampffCaches() {
    return this.http.put(
      this.apiUrl + 'icampff-caches',
      {},
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  removeIcampffCaches() {
    return this.http.delete(this.apiUrl + 'icampff-caches', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      }
    });
  }

  // EXPORT DATA

  exportData(
    entity1Id: string,
    entity1Type: string,
    entity1Variable?: string,
    entity1Start?: string,
    entity1End?: string,
    entity2Id?: string,
    entity2Type?: string,
    entity2Variable?: string,
    entity2Start?: string,
    entity2End?: string
  ) {
    return this.http.get<{ data: string; minDate: Date; maxDate: Date }>(
      this.apiUrl + 'export-data-csv',
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        },
        params: {
          entity1Id: entity1Id,
          entity1Type: entity1Type,
          entity1Variable: entity1Variable,
          entity1Start: entity1Start,
          entity1End: entity1End,
          entity2Id: entity2Id,
          entity2Type: entity2Type,
          entity2Variable: entity2Variable,
          entity2Start: entity2Start,
          entity2End: entity2End
        }
      }
    );
  }

  // MISC

  // VALID DATES

  getValidDates(entityId: string, entityType: string, variable?: string) {
    return this.http.get<string[]>(this.apiUrl + 'valid-dates', {
      headers: {
        'conten-type': 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      params: {
        entityId: entityId,
        variable: variable,
        entityType: entityType
      }
    });
  }

  // USERS

  getUsers(name: string, pageIndex: number, pageSize: number) {
    return this.http.get<Page<User[]>>(this.apiUrl + 'users', {
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

  newUser(name: string, password: string, email: string, entity: string, type: string) {
    return this.http.post<User>(
      this.apiUrl + 'users',
      {
        name: name,
        password: password,
        email: email,
        enabled: true,
        entity: entity,
        type: type
      },
      {
        headers: {
          'conten-type': 'application/json',
          Authorization: 'Bearer ' + this.token
        }
      }
    );
  }

  deleteUser(id: string) {
    return this.http.delete(this.apiUrl + 'users', {
      headers: {
        Authorization: 'Bearer ' + this.token
      },
      params: {
        id: id
      }
    });
  }

  editUser(user: User) {
    return this.http.put(this.apiUrl + 'users', user, {
      headers: {
        Authorization: 'Bearer ' + this.token
      }
    });
  }
}
