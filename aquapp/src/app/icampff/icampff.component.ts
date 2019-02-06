import { Component, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { MatPaginator, MatSort } from '@angular/material';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '../message/message.service';
import { IcampffAvg } from '../models/icampff-avg.model';
import { Node } from '../models/node.model';
import { WaterBody } from '../models/water-body.model';

@Component({
  selector: 'app-icampff',
  templateUrl: './icampff.component.html',
  styleUrls: ['./icampff.component.scss'],
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
export class IcampffComponent implements OnInit {
  isLoadingResults = true;
  pageSize = 10;
  creatingNewElement = false;
  data: IcampffAvg[];
  resultsLength = 0;
  name: '';
  displayedColumns = ['value', 'date'];

  jsonImport: string;

  editting: false;

  variable: string;

  newIcampffAvgValue: string;
  newIcampffAvgDate: Date = new Date();

  expandedElement: IcampffAvg;
  expandedIcampffAvgValue: number;
  expandedIcampffAvgDate: Date = new Date();

  toBeDeleted: IcampffAvg;

  waterBodyId: string;
  nodes: Node[] = [];
  values: number[][] = [];
  valuesPlaceHolder: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  variables: string[] = [
    'Dissolved Oxygen (DO)',
    'Nitrate (NO3)',
    'Total Suspended Solids (TSS)',
    'Thermotolerant Coliforms',
    'pH',
    'Chrolophyll A (CLA)',
    'Biochemical Oxygen Demand (BOD)',
    'Phosphates (PO4)'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      this.waterBodyId = params['waterBodyId'];
      let waterBody: WaterBody;
      await this.apiService
        .getAWaterBody(this.waterBodyId)
        .toPromise()
        .then(wb => (waterBody = wb));
      if (!waterBody) {
        this.messageService.show('Error cargando datos, recargue la página');
        return;
      }
      let nodes: Node[];
      await this.apiService
        .getAllNodes()
        .toPromise()
        .then(n => (nodes = n.items));
      if (!nodes) {
        this.messageService.show('Error cargando datos, recargue la página');
        return;
      }
      for (const node of nodes) {
        if (waterBody.nodes.indexOf(node.id) !== -1) {
          this.nodes.push(node);
          this.values.push([-1, -1, -1, -1, -1, -1, -1, -1]);
        }
      }
      this.refresh();
    });
  }

  refresh() {
    this.apiService
      .getIcampffPage(this.waterBodyId, 0, this.pageSize)
      .subscribe(
        page => {
          this.data = page.items;
          this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

          merge(this.sort.sortChange, this.paginator.page)
            .pipe(
              startWith({}),
              switchMap(() => {
                this.isLoadingResults = true;
                return this.apiService.getIcampffPage(
                  this.waterBodyId,
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
          this.messageService.show('Error cargando');
        }
      );
  }

  selectIcampffAvg(nodeType: IcampffAvg) {
    this.expandedElement = nodeType;
    this.editting = false;
  }

  deselectIcampffAvg() {
    this.expandedElement = undefined;
  }

  confirmIcampffAvgDeletion(nodeType: IcampffAvg) {
    this.toBeDeleted = nodeType;
    this.messageService.show(
      'Seguro que desea eliminar?',
      'Sí',
      this,
      'deleteIcampffAvg'
    );
  }

  deleteIcampffAvg() {
    this.apiService
      .deleteIcampff(
        this.waterBodyId,
        new Date(this.expandedElement.date).toISOString()
      )
      .subscribe(
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

  async newIcampffAvg() {
    console.log(this.values);
    let index = 0;
    this.messageService.show('Creando el icampff, por favor, espere');
    this.close();
    const promises: Promise<any>[] = [];
    for (const node of this.nodes) {
      promises.push(
        this.apiService
          .newIcampff(this.newIcampffAvgDate, this.values[index], node.id)
          .toPromise()
      );
      index++;
    }
    await Promise.all(promises).then(
      () => this.messageService.show('Icampff creado, actualizando cachés'),
      () =>
        this.messageService.show(
          'Error creando alguno de los valores, borre el nuevo icampff creado, los cachés y vuelva a intentar'
        )
    );
    await this.apiService
      .buildIcampffCaches()
      .toPromise()
      .then(
        () => {
          this.messageService.show('Cachés actualizados');
          this.refresh();
        },
        () => this.messageService.show('Error actualizando los cachés')
      );
  }

  updateValue(i: number, j: number, value: string) {
    this.values[i][j] = parseInt(value, 10);
    console.log(this.values);
  }

  close() {
    window.scroll(0, 0);
    this.creatingNewElement = false;
  }

  async buildCache() {
    await this.apiService
      .buildIcampffCaches()
      .toPromise()
      .then(
        () => this.messageService.show('Cachés construídos'),
        () => this.messageService.show('Error construyendo los cachés')
      );
  }

  async removeCaches() {
    await this.apiService
      .removeIcampffCaches()
      .toPromise()
      .then(
        () => this.messageService.show('Cachés removidos'),
        () => this.messageService.show('Error removiendo cachés')
      );
  }
}
