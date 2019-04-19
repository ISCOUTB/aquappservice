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
import { Router } from '@angular/router';
import { NodeType } from 'src/app/models/node-type.model';
import { WaterBody } from 'src/app/modules/aquapp/models/water-body.model';
import { ApiService } from 'src/app/services/api/api.service';
import { MessageService } from 'src/app/modules/utils/message/services/message/message.service';
import { Node } from 'src/app/models/node.model';

@Component({
  selector: 'app-nodes',
  templateUrl: './nodes.component.html',
  styleUrls: ['./nodes.component.scss'],
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
export class NodesComponent implements OnInit {
  isLoadingResults = true;
  pageSize = 10;
  creatingNewElement = false;
  data: Node[];
  resultsLength = 0;
  name: '';
  displayedColumns = ['name', 'nodeTypeId', 'location'];

  jsonImport: string;

  editting: false;
  waterBodyType: string;

  newNodeName: string;
  newNodeLocation: string;
  newNodeCoordinates: number[];
  newNodeStatus: string;
  newNodeNodeTypeId: string;
  newNodeWaterBodyId: string;

  nodeTypes: NodeType[];
  waterBodies: WaterBody[];

  status = ['Off', 'Real Time', 'Non Real Time'];

  expandedElement: Node;
  expandedNodeName: string;
  expandedNodeLocation: string;
  expandedNodeCoordinates: number[];
  expandedNodeStatus: string;
  expandedNodeNodeTypeId: string;
  expandedNodewaterBodyId: string;

  expandedNodeLatitude: number;
  expandedNodeLongitude: number;

  toBeDeleted: Node;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getData();
    this.refresh();
  }

  async getData() {
    await this.apiService
      .getAllNodeTypes()
      .toPromise()
      .then(
        nodeTypes => (this.nodeTypes = nodeTypes),
        () => (this.nodeTypes = [])
      );
  }

  refresh() {
    this.apiService.getNodesPage('', 0, this.pageSize).subscribe(
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

  selectNode(nodeType: Node) {
    this.expandedElement = nodeType;
    this.editting = false;
    this.expandedNodeName = this.expandedElement.name;
    this.expandedNodeLocation = this.expandedElement.location;

    this.expandedNodeLatitude = this.expandedElement.coordinates[0];
    this.expandedNodeLongitude = this.expandedElement.coordinates[1];

    this.expandedNodeNodeTypeId = this.expandedElement.nodeTypeId;
    this.expandedNodeStatus = this.expandedElement.status;
  }

  deselectNode() {
    this.expandedElement = undefined;
    this.expandedNodeName = undefined;
    this.expandedNodeLocation = undefined;
    this.expandedNodeCoordinates = undefined;
    this.expandedNodeNodeTypeId = undefined;
    this.expandedNodeStatus = undefined;
    this.expandedNodeLatitude = undefined;
    this.expandedNodeLongitude = undefined;
  }

  saveNode() {
    const node = new Node();
    node.id = this.expandedElement.id;
    node.name = this.expandedNodeName;
    node.location = this.expandedNodeLocation;
    node.coordinates = [this.expandedNodeLatitude, this.expandedNodeLongitude];
    node.nodeTypeId = this.expandedNodeNodeTypeId;
    this.apiService.editNode(node).subscribe(
      () => {
        this.editting = false;
        this.deselectNode();
        this.refresh();
        this.messageService.show('Cambios guardados');
      },
      () => {
        this.messageService.show('Error editando');
        this.refresh();
      }
    );
  }

  confirmNodeDeletion(nodeType: Node) {
    this.toBeDeleted = nodeType;
    this.messageService.show(
      'Seguro que desea eliminar?',
      'Sí',
      this,
      'deleteNode'
    );
  }

  deleteNode() {
    this.apiService.deleteNode(this.toBeDeleted.id).subscribe(
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

  newNode() {
    if (this.jsonImport) {
      try {
        console.log('Importando');
        const newNodes: Node[] = JSON.parse(this.jsonImport);
        const promises: Promise<any>[] = [];
        for (const node of newNodes) {
          promises.push(
            this.apiService
              .newNode(
                node.name,
                node.location,
                node.coordinates,
                node.status,
                node.nodeTypeId,
                node.id
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
      return;
    }
    if (
      this.newNodeName &&
      this.newNodeLocation &&
      this.newNodeNodeTypeId &&
      this.newNodeCoordinates &&
      this.newNodeStatus &&
      (this.newNodeNodeTypeId === this.waterBodyType
        ? this.newNodeWaterBodyId
        : true)
    ) {
      this.apiService
        .newNode(
          this.newNodeName,
          this.newNodeLocation,
          this.newNodeCoordinates,
          this.newNodeStatus,
          this.newNodeNodeTypeId,
          this.newNodeWaterBodyId
        )
        .subscribe(
          () => {
            this.messageService.show('Creado con éxito');
            this.creatingNewElement = false;
            this.refresh();
          },
          () => this.messageService.show('Error al crear')
        );
    } else {
      this.messageService.show('Complete el formulario');
    }
  }

  nodeData() {
    this.router.navigate(['formulario-obtener-datos-de-los-nodos'], {
      queryParams: {
        id: this.expandedElement.id,
        nodeTypeId: this.expandedElement.nodeTypeId
      }
    });
  }

  updateCoords(coords: number[]) {
    this.newNodeCoordinates = coords;
  }

  getNodeTypeName(id: string) {
    if (this.nodeTypes === undefined) {
      return '';
    }
    for (const nodeType of this.nodeTypes) {
      if (nodeType.id === id) {
        return nodeType.name;
      }
    }
  }

  close() {
    window.scroll(0, 0);
    this.creatingNewElement = false;
  }

  editNode() {
    this.router.navigate(['formulario-editar-nodo'], {
      queryParams: {
        nodeId: this.expandedElement.id
      }
    });
  }
}
