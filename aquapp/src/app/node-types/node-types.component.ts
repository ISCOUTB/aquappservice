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
import { Router } from '@angular/router';
import { MessageService } from '../message/message.service';
import { NodeType } from '../models/node-type.model';

@Component({
  selector: 'app-node-types',
  templateUrl: './node-types.component.html',
  styleUrls: ['./node-types.component.scss'],
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
export class NodeTypesComponent implements OnInit {
  isLoadingResults = true;
  pageSize = 10;
  creatingNewElement = false;
  data: NodeType[];
  resultsLength = 0;
  name: '';
  displayedColumns = ['name'];

  jsonImport: string;

  editting: false;

  newNodeTypeName: string;
  newNodeTypeSeparator: string;

  expandedElement: NodeType;
  expandedNodeTypeName: string;
  expandedNodeTypeSeparator: string;

  toBeDeleted: NodeType;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.apiService.getNodeTypesPage('', 0, this.pageSize).subscribe(
      users => {
        this.data = users.items;
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
          .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;
              return this.apiService.getNodeTypesPage(
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

  selectNodeType(nodeType: NodeType) {
    this.expandedElement = nodeType;
    this.editting = false;
    this.expandedNodeTypeName = this.expandedElement.name;
    this.expandedNodeTypeSeparator = this.expandedElement.separator;
  }

  deselectNodeType() {
    this.expandedElement = undefined;
    this.expandedNodeTypeName = undefined;
    this.expandedNodeTypeSeparator = undefined;
  }

  saveNodeType() {
    const nodeType = new NodeType();
    nodeType.id = this.expandedElement.id;
    nodeType.name = this.expandedNodeTypeName;
    nodeType.separator = this.expandedNodeTypeSeparator;
    this.apiService.editNodeType(nodeType).subscribe(
      () => {
        this.editting = false;
        this.deselectNodeType();
        this.refresh();
        this.messageService.show('Cambios guardados');
      },
      () => {
        this.messageService.show('Error editando');
        this.refresh();
      }
    );
  }

  confirmNodeTypeDeletion(nodeType: NodeType) {
    this.toBeDeleted = nodeType;
    this.messageService.show(
      'Seguro que desea eliminar?',
      'Sí',
      this,
      'deleteNodeType'
    );
  }

  deleteNodeType() {
    this.apiService.deleteNodeType(this.toBeDeleted.id).subscribe(
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

  newNodeType() {
    if (this.newNodeTypeName && this.newNodeTypeSeparator) {
      this.apiService
        .newNodeType(this.newNodeTypeName, this.newNodeTypeSeparator)
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
        const newNodeTypes: NodeType[] = JSON.parse(this.jsonImport);
        const promises: Promise<any>[] = [];
        for (const nodeType of newNodeTypes) {
          promises.push(
            this.apiService
              .newNodeType(nodeType.name, nodeType.separator)
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

  sensors() {
    this.router.navigate(['sensores'], {
      queryParams: {
        id: this.expandedElement.id
      }
    });
  }
}
