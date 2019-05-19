import { Map, Marker, LatLngBounds, latLngBounds, DivIcon } from 'leaflet';
import { HydroMFLegendComponent } from './legend/hydro-metereologic-factors-legend.component';
import { HydroMFControlComponent } from './controls/hydro-metereologic-factors-control.component';
import { ApiService } from 'src/app/services/api/api.service';
import { NgZone, ComponentFactoryResolver } from '@angular/core';
import { TranslateService } from 'src/app/modules/utils/translation/services/translate/translate.service';
import { TranslatePipe } from 'src/app/modules/utils/translation/pipes/translate/translate.pipe';
import { AquAppComponent } from 'src/app/modules/aquapp/components/home/aquapp.component';
import { Node } from 'src/app/models/node.model';
import { MarkerLayer } from 'src/app/layers/marker-layer.model';

export class HydroMetereologicFactorsLayer implements MarkerLayer {
  name = 'Hydro-Metereologic Factors';
  status: string;
  description: string;
  map: Map;
  markers: Marker<any>[];
  nodes: Node[];
  apiService: ApiService;
  ngZone: NgZone;
  translateService: TranslateService;
  translatePipe: TranslatePipe;
  parent: AquAppComponent;
  componentFactoryResolver: ComponentFactoryResolver;

  constructor(parent: AquAppComponent) {
    this.parent = parent;
    this.componentFactoryResolver = this.parent.componentFactoryResolver;
    this.map = this.parent.map;
    this.apiService = this.parent.apiService;
    this.translateService = this.parent.translateService;
    this.translatePipe = this.parent.translatePipe;
    this.parent = parent;
  }

  async add(): Promise<void> {
    this.status = 'on';
    if (!this.nodes) {
      await this.apiService
        .getAllNodes('59c9d9019a892016ca4be413')
        .toPromise()
        .then(
          page => (this.nodes = page.items),
          () => {
            this.status = 'error';
          }
        );
    }
    if (this.status === 'error') {
      return;
    }
    this.addMarkers();
  }

  addMarkers() {
    this.markers = [];
    for (const node of this.nodes) {
      let ico_url: string;
      switch (node.status) {
        case 'Real Time':
          ico_url = 'assets/glyph-marker-icon-green.png';
          break;
        case 'Non Real Time':
          ico_url = 'assets/glyph-marker-icon-blue.png';
          break;
        case 'Off':
          ico_url = 'assets/glyph-marker-icon-gray.png';
          break;
        default:
          ico_url = 'assets/glyph-marker-icon-gray.png';
          break;
      }

      const nodeTypeName = this.translateService.translate('HF');

      const ico = new DivIcon({
        className: 'xolonium',
        html: `
          <div class="container">
            <img
              style="
                position: relative;
                text-align: center;
                color: white;"
              src="${ico_url}"
            ></img>
            <span
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                font-size: 8pt;
                font-family: monospace;
                transform: translate(0, 50%);
                color: #fff;"
            >${nodeTypeName}</span>
          </div>
        `,
        iconSize: [24, 36],
        iconAnchor: [12, 36]
      });
      const marker = new Marker([node.coordinates[0], node.coordinates[1]], {
        title: node.name,
        icon: ico
      });
      marker.bindPopup(`
        <h1>${node.name}</h1>
        <p>${this.translateService.translate('Location')}: ${node.location}</p>
        <a class="passive-link" data-url="formulario-exportar-datos" data-entity1Id="${
          node.id
        }">${this.translateService.translate('Export data')}</any>
      `);
      marker.addTo(this.map);

      const self = this.parent;
      marker.on('popupopen', function() {
        // add event listener to newly added a.merch-link element
        self.elementRef.nativeElement
          .querySelector('.passive-link')
          .addEventListener('click', e => {
            // get id from attribute
            const url = e.target.getAttribute('data-url');
            const id = e.target.getAttribute('data-entity1Id');
            self.ngZone.run(() => {
              self.router.navigate([url], {
                queryParams: {
                  entity1Id: id,
                  entity1Type: 'node'
                }
              });
            });
          });
      });

      this.markers.push(marker);
    }
  }

  getBounds(): LatLngBounds | null {
    return this.markers
      ? latLngBounds(this.markers.map(marker => marker.getLatLng()))
      : null;
  }

  removeMarkers() {
    for (const marker of this.markers) {
      marker.removeFrom(this.map);
    }
    this.markers = [];
  }

  remove(): void {
    if (this.status === 'on') {
      this.removeMarkers();
    }
    this.status = 'off';
    // Remove leyend and controls
    if (this.parent.selectedLayer === this.name) {
      let viewContainerRef = this.parent.pluginComponents.toArray()[0]
        .viewContainerRef;
      viewContainerRef.clear();
      viewContainerRef = this.parent.pluginComponents.toArray()[1]
        .viewContainerRef;
      viewContainerRef.clear();
    }
  }

  showLegend(): void {
    const viewContainerRef = this.parent.pluginComponents.toArray()[0]
      .viewContainerRef;
    viewContainerRef.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      HydroMFLegendComponent
    );
    viewContainerRef.createComponent(componentFactory, 0);
  }

  showControls(): void {
    // Add the controls
    const viewContainerRef = this.parent.pluginComponents.toArray()[1]
      .viewContainerRef;
    viewContainerRef.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      HydroMFControlComponent
    );
    viewContainerRef.createComponent(componentFactory, 0);
  }
}
