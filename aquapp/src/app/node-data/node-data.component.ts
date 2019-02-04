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
import { Datum } from '../models/datum.model';

@Component({
  selector: 'app-node-data',
  templateUrl: './node-data.component.html',
  styleUrls: ['./node-data.component.scss'],
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
export class NodeDataComponent implements OnInit {
  isLoadingResults = true;
  pageSize = 10;
  creatingNewElement = false;
  data: Datum[];
  resultsLength = 0;
  name: '';
  displayedColumns = ['value', 'date'];

  jsonImport: string;

  editting: false;

  variable: string;

  newDatumValue: string;
  newDatumDate: Date = new Date();

  expandedElement: Datum;
  expandedDatumValue: string;
  expandedDatumDate: Date = new Date();

  toBeDeleted: Datum;

  nodeId: string;
  start: string;
  end: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.nodeId = params['id'];
      this.variable = params['variable'];
      this.start = params['start'];
      this.end = params['end'];
      this.refresh();
    });
  }

  refresh() {
    this.apiService
      .getDataPage(
        this.nodeId,
        0,
        this.pageSize,
        this.variable,
        this.start,
        this.end
      )
      .subscribe(
        page => {
          this.data = page.items;
          this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

          merge(this.sort.sortChange, this.paginator.page)
            .pipe(
              startWith({}),
              switchMap(() => {
                this.isLoadingResults = true;
                return this.apiService.getDataPage(
                  this.nodeId,
                  this.paginator.pageIndex,
                  this.paginator.pageSize,
                  this.variable,
                  this.start,
                  this.end
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

  selectDatum(nodeType: Datum) {
    this.expandedElement = nodeType;
    this.editting = false;
    this.expandedDatumDate = this.expandedElement.date;
    this.expandedDatumValue = this.expandedElement.value;
  }

  deselectDatum() {
    this.expandedElement = undefined;
    this.expandedDatumDate = undefined;
    this.expandedDatumValue = undefined;
  }

  saveDatum() {
    const datum = new Datum();
    datum.id = this.expandedElement.id;
    datum.date = this.expandedDatumDate;
    datum.value = this.expandedDatumValue;
    // datum.variable = this.expandedDatumVariable;
    this.apiService
      .editDatum(
        datum,
        this.nodeId,
        new Date(this.expandedElement.date).toISOString()
      )
      .subscribe(
        () => {
          this.editting = false;
          this.deselectDatum();
          this.refresh();
          this.messageService.show('Cambios guardados');
        },
        () => {
          this.messageService.show('Error editando');
          this.refresh();
        }
      );
  }

  confirmDatumDeletion(nodeType: Datum) {
    this.toBeDeleted = nodeType;
    this.messageService.show(
      'Seguro que desea eliminar?',
      'Sí',
      this,
      'deleteDatum'
    );
  }

  deleteDatum() {
    this.apiService
      .deleteDatum(
        this.nodeId,
        this.variable,
        new Date(this.toBeDeleted.date).toISOString()
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

  newDatum() {
    if (this.newDatumDate && this.newDatumValue) {
      this.apiService
        .newDatum(
          this.newDatumDate,
          this.variable,
          this.nodeId,
          this.newDatumValue
        )
        .subscribe(
          () => {
            this.messageService.show('Creado con éxito');
            this.creatingNewElement = false;
            this.refresh();
          },
          () => this.messageService.show('Error al crear')
        );
    } else if (this.jsonImport) {
      try {
        const newData: Datum[] = JSON.parse(this.jsonImport);
        const promises: Promise<any>[] = [];
        for (const datum of newData) {
          promises.push(
            this.apiService
              .newDatum(
                new Date(datum.date),
                this.variable,
                this.nodeId,
                datum.value
              )
              .toPromise()
          );
        }
        Promise.all(promises).then(
          () => {
            this.messageService.show('Creados con éxito');
            this.creatingNewElement = false;
            this.refresh();
          },
          () => this.messageService.show('Error creando')
        );
      } catch (e) {
        this.messageService.show(
          'Error importando, revise si el formato es correcto'
        );
      }
    }
  }

  close() {
    window.scroll(0, 0);
    this.creatingNewElement = false;
  }
}
