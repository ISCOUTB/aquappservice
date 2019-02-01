import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api/api.service';
import { MessageService } from '../message/message.service';
import { Sensor } from '../models/sensor.model';
import { MatPaginator, MatSort } from '@angular/material';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { merge, of as observableOf } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ]),
    trigger('newExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none', opacity: 0 })
      ),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('525ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0', height: 0 }),
        animate('0.5s ease-out', style({ opacity: '1', height: '*' }))
      ])
    ])
  ]
})
export class SensorsComponent implements OnInit {
  isLoadingResults = true;
  pageSize = 10;
  creatingNewElement = false;
  data: Sensor[];
  resultsLength = 0;
  name: '';
  displayedColumns = ['variable'];

  jsonImport: string;

  editting: false;

  newSensorVariable: string;
  newSensorUnit: string;

  expandedElement: Sensor;
  expandedSensorVariable: string;
  expandedSensorUnit: string;

  toBeDeleted: Sensor;

  nodeTypeId: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.nodeTypeId = params['id'];
      this.refresh();
    });
  }

  refresh() {
    this.apiService
      .getSensorsPage(this.nodeTypeId, '', 0, this.pageSize)
      .subscribe(
        users => {
          this.data = users.items;
          this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

          merge(this.sort.sortChange, this.paginator.page)
            .pipe(
              startWith({}),
              switchMap(() => {
                this.isLoadingResults = true;
                return this.apiService.getSensorsPage(
                  this.nodeTypeId,
                  this.name,
                  this.paginator.pageIndex,
                  this.paginator.pageSize
                );
              }),
              map(data => {
                this.isLoadingResults = false;
                this.resultsLength = data.total;

                return data.items;
              }),
              catchError(() => {
                this.isLoadingResults = false;
                return observableOf([]);
              })
            )
            .subscribe(data => (this.data = data));
        },
        () => {
          this.isLoadingResults = false;
          this.messageService.show('Error cargando los Periodos electorales');
        }
      );
  }

  selectSensor(sensor: Sensor) {
    this.expandedElement = sensor;
    this.editting = false;
    this.expandedSensorVariable = this.expandedElement.variable;
    this.expandedSensorUnit = this.expandedElement.unit;
  }

  deselectSensor() {
    this.expandedElement = undefined;
    this.expandedSensorVariable = undefined;
    this.expandedSensorUnit = undefined;
  }

  saveSensor() {
    const sensor = new Sensor();
    sensor.id = this.expandedElement.id;
    sensor.nodeTypeId = this.nodeTypeId;
    sensor.variable = this.expandedSensorVariable;
    sensor.unit = this.expandedSensorUnit;
    this.apiService.editSensor(sensor).subscribe(
      () => {
        this.editting = false;
        this.deselectSensor();
        this.refresh();
        this.messageService.show('Cambios guardados');
      },
      () => {
        this.messageService.show('Error editando');
        this.refresh();
      }
    );
  }

  confirmSensorDeletion(sensor: Sensor) {
    this.toBeDeleted = sensor;
    this.messageService.show(
      'Seguro que desea eliminar?',
      'Sí',
      this,
      'deleteSensor'
    );
  }

  deleteSensor() {
    this.apiService.deleteSensor(this.toBeDeleted.id).subscribe(
      () => {
        this.messageService.show('Eliminado con éxito');
        this.paginator.pageIndex = 0;
        this.refresh();
      },
      () => {
        this.messageService.show('Error eliminando');
      }
    );
  }

  newSensor() {
    if (this.newSensorVariable && this.newSensorUnit) {
      this.apiService
        .newSensor(this.nodeTypeId, this.newSensorVariable, this.newSensorUnit)
        .subscribe(
          () => {
            this.messageService.show('Creado con éxito');
            this.creatingNewElement = false;
            this.refresh();
          },
          () => this.messageService.show('Error al crear')
        );
    }
    if (this.jsonImport) {
      try {
        const newSensors: Sensor[] = JSON.parse(this.jsonImport);
        const promises: Promise<any>[] = [];
        for (const sensor of newSensors) {
          promises.push(
            this.apiService
              .newSensor(this.nodeTypeId, sensor.variable, sensor.unit || 'None')
              .toPromise()
          );
        }
        Promise.all(promises).then(
          () => {
            this.creatingNewElement = false;
            this.refresh();
            this.messageService.show('Creados con éxito');
          },
          () => this.messageService.show('Error al crear')
        );
      } catch (e) {
        this.messageService.show('Error, revise si el formato es correcto.');
      }
    }
  }
}
