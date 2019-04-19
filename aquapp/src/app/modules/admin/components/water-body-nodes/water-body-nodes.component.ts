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
import { Router, ActivatedRoute } from '@angular/router';
import { WaterBody } from 'src/app/modules/aquapp/models/water-body.model';
import { ApiService } from 'src/app/services/api/api.service';
import { MessageService } from 'src/app/services/message/message.service';
import { Node } from 'src/app/models/node.model';

@Component({
  selector: 'app-water-body-nodes',
  templateUrl: './water-body-nodes.component.html',
  styleUrls: ['./water-body-nodes.component.scss'],
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
export class WaterBodyNodesComponent implements OnInit {
  isLoadingResults = true;
  pageSize = 10;
  creatingNewElement = false;
  data: Node[];
  resultsLength = 0;
  name: '';
  displayedColumns = ['name'];

  jsonImport: string;

  editting: false;
  waterBodyType: string;

  status = ['Off', 'On'];

  expandedElement: Node;

  freeNodes: Node[];
  toBeAdded: string;
  waterBodyId: string;
  waterBody: WaterBody;

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
      this.waterBodyId = params['waterBodyId'];
      this.getData();
    });
  }

  async getData() {
    await this.apiService
      .getAWaterBody(this.waterBodyId)
      .toPromise()
      .then(
        wb => {
          this.waterBody = wb;
          this.refresh();
        },
        () =>
          this.messageService.show('Error obteniendo datos, recargue la página')
      );
    await this.apiService
      .getNodesPage('', 0, 0, '', '59c9d9019a892016ca4be412')
      .toPromise()
      .then(
        nodes => {
          this.freeNodes = nodes.items.filter(fn =>
            this.waterBody.nodes !== undefined
              ? this.waterBody.nodes.indexOf(fn.id) === -1
              : fn
          );
        },
        () => (this.freeNodes = [])
      );
  }

  refresh() {
    this.apiService
      .getNodesPage('', 0, this.pageSize, this.waterBody.id)
      .subscribe(
        page => {
          this.data = page.items;
          this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

          merge(this.sort.sortChange, this.paginator.page)
            .pipe(
              startWith({}),
              switchMap(() => {
                this.isLoadingResults = true;
                return this.apiService.getNodesPage(
                  this.name,
                  this.paginator.pageIndex,
                  this.paginator.pageSize,
                  this.waterBody.id
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

  selectNode(nodeType: Node) {
    this.expandedElement = nodeType;
    this.editting = false;
  }

  deselectNode() {
    this.expandedElement = undefined;
  }

  confirmRemoval() {
    this.messageService.show(
      'Seguro que desea eliminar?',
      'Sí',
      this,
      'removeNode'
    );
  }

  nodeData() {
    this.router.navigate(['formulario-obtener-datos-de-los-nodos'], {
      queryParams: {
        id: this.expandedElement.id,
        nodeTypeId: this.expandedElement.nodeTypeId
      }
    });
  }

  async removeNode() {
    this.waterBody.nodes =
      this.waterBody.nodes === undefined ? [] : this.waterBody.nodes;
    const index = this.waterBody.nodes.indexOf(this.expandedElement.id);
    if (index === -1) {
      this.messageService.show(
        'Error, el nodo NO está asignado al cuerpo de agua'
      );
    } else {
      this.waterBody.nodes.splice(index, 1);
      await this.apiService
        .editWaterBody(this.waterBody)
        .toPromise()
        .then(
          () => {
            this.messageService.show('Nodo removido');
            this.getData();
            this.close();
          },
          () =>
            this.messageService.show(
              'Error removiendo el nodo, recargue la página'
            )
        );
    }
  }

  async addNode() {
    this.waterBody.nodes =
      this.waterBody.nodes === undefined ? [] : this.waterBody.nodes;
    if (this.waterBody.nodes.indexOf(this.toBeAdded) === -1) {
      this.waterBody.nodes.push(this.toBeAdded);
      await this.apiService
        .editWaterBody(this.waterBody)
        .toPromise()
        .then(
          () => {
            this.messageService.show('Nodo añadido');
            this.getData();
            this.close();
          },
          () =>
            this.messageService.show(
              'Error añadiendo el nodo, recargue la página'
            )
        );
    } else {
      console.log(
        this.messageService.show(
          'Error, el nodo ya está asignado al cuerpo de agua'
        )
      );
    }
  }

  close() {
    window.scroll(0, 0);
    this.creatingNewElement = false;
  }
}
