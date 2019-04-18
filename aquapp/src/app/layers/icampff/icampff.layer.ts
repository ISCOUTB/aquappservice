import { FigureLayer } from '../figure-layer.model';
import {
  Map,
  FeatureGroup,
  geoJSON,
  LatLngBounds,
  latLngBounds,
  LatLng
} from 'leaflet';
import { WaterBody } from 'src/app/models/water-body.model';
import { ApiService } from 'src/app/services/api/api.service';
import { IcampffAvg } from 'src/app/models/icampff-avg.model';
import { NgZone } from '@angular/core';
import { TranslateService } from 'src/app/services/translate/translate.service';
import { TranslatePipe } from 'src/app/pipes/translate/translate.pipe';
import { AquAppComponent } from 'src/app/components/overview/overview.component';
import { ComponentFactoryResolver } from '@angular/core/src/render3';
import { IcampffControlComponent } from './controls/icampff-control.component';
import { IcampffLegendComponent } from './legend/icampff-legend.component';

export class IcampffLayer implements FigureLayer {
  name = 'ICAMpff';
  controlsComponent = 'icampff-control';
  legendComponent = 'icampff-leyend';
  status = 'off';
  description: string;
  map: Map;
  figures: FeatureGroup = new FeatureGroup();

  waterBodies: WaterBody[];
  icampffAvgsPerWaterBody: IcampffAvg[][] = [];
  apiService: ApiService;
  ngZone: NgZone;
  translateService: TranslateService;
  translatePipe: TranslatePipe;
  parent: AquAppComponent;
  componentFactoryResolver: ComponentFactoryResolver;
  icamDates: Date[];

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
    if (!this.waterBodies) {
      await this.apiService
        .getAllWaterBodies()
        .toPromise()
        .then(wbs => (this.waterBodies = wbs), () => (this.status = 'error'));
      if (this.status === 'error') {
        return;
      }
      for (const waterBody of this.waterBodies) {
        await this.apiService
          .getAllIcampff(waterBody.id)
          .toPromise()
          .then(
            ia => this.icampffAvgsPerWaterBody.push(ia),
            () => (this.status = 'error')
          );
      }
    }
    this.addWaterBodies('Latest available');
    this.icamDates = [];
    for (const icampffAvgs of this.icampffAvgsPerWaterBody) {
      for (const icampffAvg of icampffAvgs) {
        if (this.icamDates.indexOf(icampffAvg.date) === -1) {
          this.icamDates.push(icampffAvg.date);
        }
      }
    }
  }

  getBounds(): LatLngBounds | null {
    return this.figures ? this.figures.getBounds() : null;
  }

  showLegend(): void {
    const viewContainerRef = this.parent.pluginComponents.toArray()[0]
      .viewContainerRef;
    viewContainerRef.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      IcampffLegendComponent
    );
    viewContainerRef.createComponent(componentFactory, 0);
  }

  showControls(): void {
    // Add the controls
    const viewContainerRef = this.parent.pluginComponents.toArray()[1]
      .viewContainerRef;
    viewContainerRef.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      IcampffControlComponent
    );
    const componentRef = viewContainerRef.createComponent(componentFactory, 0);
    (<IcampffControlComponent>componentRef.instance).icamDates = this.icamDates;
    componentRef.instance.removeWaterBodies.subscribe(() => {
      this.removeFigures();
    });
    componentRef.instance.addWaterBodies.subscribe((date: string) => {
      this.addWaterBodies(date);
    });
  }

  getColor(icampff: number) {
    return icampff > 90
      ? '#0032FF' // blue
      : icampff > 70
      ? '#49C502' // green
      : icampff > 50
      ? '#F9F107' // yellow
      : icampff > 25
      ? '#F57702' // orange
      : icampff === -1
      ? '#555555'
      : '#FB1502'; // red
  }

  addWaterBodies(icampffDate: string) {
    let index = 0;
    for (const waterBody of this.waterBodies) {
      let icampff: number;
      if (icampffDate === 'Latest available') {
        icampff = this.icampffAvgsPerWaterBody[index].length
          ? this.icampffAvgsPerWaterBody[index][
              this.icampffAvgsPerWaterBody[index].length - 1
            ].value
          : -1;
      } else {
        const icampffIndex: number = this.icampffAvgsPerWaterBody[
          index
        ].findIndex(ica => ica.date.toString() === icampffDate);
        if (icampffIndex === -1) {
          icampff = -1;
        } else {
          icampff = this.icampffAvgsPerWaterBody[index][icampffIndex].value;
        }
      }
      const geojson = geoJSON(JSON.parse(waterBody.geojson), {
        style: {
          weight: 2,
          opacity: 0.3,
          dashArray: '',
          fillColor: this.getColor(icampff),
          color: 'black',
          fillOpacity: 0.7
        }
      });
      geojson.eachLayer(layer => {
        layer.bindPopup(`
          <h1>${waterBody.name}</h1>
          <p>
            ICAMpff: ${
              icampff !== -1
                ? icampff.toFixed(2)
                : this.translateService.translate(
                    'Unavailable for the current date'
                  )
            }
          </p>
          <p>
            ${this.translateService.translate(
              'Meassure date'
            )}: ${this.translatePipe.transform(
          new Date(
            this.icampffAvgsPerWaterBody[index][
              this.icampffAvgsPerWaterBody[index].length - 1
            ].date
          ),
          { type: 'date', fullDate: true }
        )}
          </p>
          <a class="passive-link" data-url="formulario-exportar-datos" data-entity1Id="${
            waterBody.id
          }">${this.translateService.translate('Export data')}</a>
        `);
        const parent = this.parent;
        layer.on('popupopen', function() {
          // add event listener to newly added a.merch-link element
          parent.elementRef.nativeElement
            .querySelector('.passive-link')
            .addEventListener(
              'click',
              (e: {
                target: {
                  getAttribute: { (arg0: string): void; (arg0: string): void };
                };
              }) => {
                // get id from attribute
                const url = e.target.getAttribute('data-url');
                const id = e.target.getAttribute('data-entity1Id');
                parent.ngZone.run(() => {
                  parent.router.navigate([url], {
                    queryParams: {
                      entity1Id: id,
                      entity1Type: 'waterBody'
                    }
                  });
                });
              }
            );
        });
        this.figures.addLayer(layer);
      });
      index++;
    }
    this.figures.addTo(this.map);
  }

  removeFigures() {
    this.figures.getLayers().forEach(layer => {
      this.figures.removeLayer(layer);
    });
    this.figures.removeFrom(this.map);
  }

  remove(): void {
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
    this.removeFigures();
    this.parent.fixMap();
  }
}
