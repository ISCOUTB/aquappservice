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
import { WaterBody } from '../models/water-body.model';
import { EditWaterBodyDialogComponent } from '../edit-water-body-dialog/edit-water-body-dialog.component';

@Component({
  selector: 'app-water-bodies',
  templateUrl: './water-bodies.component.html',
  styleUrls: ['./water-bodies.component.scss'],
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
export class WaterBodiesComponent implements OnInit {
  isLoadingResults = true;
  pageSize = 10;
  creatingNewElement = false;
  data: WaterBody[];
  resultsLength = 0;
  displayedColumns = ['name'];

  jsonImport: string;

  waterBodyType: string;

  newWaterBodyName: string;
  newWaterBodyGeoJSON: string;

  status = ['Off', 'On'];

  expandedElement: WaterBody;
  expandedWaterBodyName: string;
  expandedWaterBodyGeoJSON: string;

  toBeDeleted: WaterBody;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(EditWaterBodyDialogComponent)
  editFigure: EditWaterBodyDialogComponent;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.apiService.getWaterBodiesPage(0, this.pageSize).subscribe(
      page => {
        this.data = page.items;
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
          .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;
              return this.apiService.getWaterBodiesPage(
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

  selectWaterBody(waterBody: WaterBody) {
    this.expandedElement = waterBody;
  }

  deselectWaterBody() {
    this.expandedElement = undefined;
  }

  confirmWaterBodyDeletion(nodeType: WaterBody) {
    this.toBeDeleted = nodeType;
    this.messageService.show(
      'Seguro que desea eliminar?',
      'Sí',
      this,
      'deleteWaterBody'
    );
  }

  deleteWaterBody() {
    this.apiService.deleteWaterBody(this.toBeDeleted.id).subscribe(
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

  newWaterBody() {
    if (this.jsonImport) {
      try {
        console.log('Importando');
        const waterBodies: WaterBody[] = JSON.parse(this.jsonImport);
        const promises: Promise<any>[] = [];
        for (const waterBody of waterBodies) {
          promises.push(
            this.apiService
              .newWaterBody(waterBody.name, waterBody.geojson)
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

    const figure: any = this.editFigure.figures.toGeoJSON();
    if (!figure.features.length) {
        this.messageService.show(
            'Debe proporcionar el modelo del cuerpo de agua'
        );
        return;
    }
    if (this.newWaterBodyName) {
      this.apiService
        .newWaterBody(this.newWaterBodyName, JSON.stringify(figure.features[0]))
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

  nodes() {
    this.router.navigate(['nodos-del-cuerpo-de-agua'], {
      queryParams: {
        waterBodyId: this.expandedElement.id
      }
    });
  }

  icampff() {
    this.router.navigate(['icampff'], {
      queryParams: {
        waterBodyId: this.expandedElement.id
      }
    });
  }

  edit() {
    this.router.navigate(['editar-cuerpo-de-agua'], {
      queryParams: {
        id: this.expandedElement.id
      }
    });
  }

  close() {
    window.scroll(0, 0);
    this.creatingNewElement = false;
  }
}
