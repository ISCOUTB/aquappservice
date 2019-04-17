import {
  Component,
  OnInit,
  ElementRef,
  NgZone,
  ComponentFactoryResolver,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  tileLayer,
  latLng,
  Map,
  latLngBounds,
} from 'leaflet';
import { Subscription } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { TranslateService } from 'src/app/services/translate/translate.service';
import { TranslatePipe } from 'src/app/pipes/translate/translate.pipe';
import { LayerBase } from 'src/app/layers/layer-base.model';
import { IcampffLayer } from 'src/app/layers/icampff/icampff.layer';
import { PluginComponentDirective } from 'src/app/directives/plugin-component/plugin-component.directive';
import { WaterQualityLayer } from 'src/app/layers/water-quality/water-quality.layer';
import { WeatherStationLayer } from 'src/app/layers/weather-station/weather-station.layer';
import { HydroMetereologicFactorsLayer } from 'src/app/layers/hydro-metereologic-factors/hydro-metereologic-factors.layer';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
          height: '0px',
          display: 'none'
        })
      ),
      transition('void <=> *', animate(225))
    ])
  ]
})
export class OverviewComponent implements OnInit {
  mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data © OpenStreetMap contributors'
      })
    ],
    zoom: 13.5,
    center: latLng(10.4241961, -75.535)
  };
  mapStyle: any = {
    height: '100%',
    width: '100%'
  };

  map: Map;

  subscription: Subscription;
  loading = true;
  failed = false;

  menu = '';
  dataLayers: LayerBase[] = [];
  activeLayers: string[] = [];
  layerSwitches: boolean[] = [];
  layerLegend: string;
  layerControl: string;

  @ViewChildren(PluginComponentDirective) pluginComponents: QueryList<any>;

  constructor(
    public apiService: ApiService,
    public translateService: TranslateService,
    public translatePipe: TranslatePipe,
    public router: Router,
    public elementRef: ElementRef,
    public ngZone: NgZone,
    public componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.subscription = this.translateService.reload$.subscribe(rmessage => {
      for (const dataLayer of this.dataLayers) {
        if (dataLayer.status === 'on') {
          dataLayer.remove();
          dataLayer.add();
        }
      }
      this.selectLayerControl(this.layerControl);
      this.selectLayerLegend(this.layerLegend);
    });
    window.onresize = () => {
      if (this.map) {
        this.fixMap();
      }
    };
  }

  ngOnInit() {}

  selectLayerLegend(layer: string) {
    if (!layer) {
      return;
    }
    for (const dataLayer of this.dataLayers) {
      if (dataLayer.name === layer) {
        if (dataLayer.status === 'off') {
          return;
        }
        dataLayer.showLegend();
        break;
      }
    }
    this.layerLegend = layer;
  }

  selectLayerControl(layer: string) {
    if (!layer) {
      return;
    }
    for (const dataLayer of this.dataLayers) {
      if (dataLayer.name === layer) {
        if (dataLayer.status === 'off') {
          return;
        }
        dataLayer.showControls();
        break;
      }
    }
    this.layerControl = layer;
  }

  updateLayers() {
    this.loading = true;
    this.failed = false;
    let i = 0;
    this.activeLayers = [];
    const mapBounds = latLngBounds(
      latLng(10.33509, -75.584991),
      latLng(10.472579, -75.449138)
    );
    setTimeout(() => {
      const promises: Promise<void>[] = [];
      for (const layer of this.dataLayers) {
        if (layer.status === 'on' && !this.layerSwitches[i]) {
          layer.remove();
        } else if (layer.status === 'off' && this.layerSwitches[i]) {
          promises.push(layer.add());
        } else if (layer.status === 'error' && this.layerSwitches[i]) {
          promises.push(layer.add());
        }
        if (layer.status === 'on') {
          this.activeLayers.push(layer.name);
          const layerBounds = layer.getBounds();
          if (layerBounds) {
            mapBounds.extend(layerBounds);
          }
        }
        i++;
      }
      Promise.all(promises).then(() => {
        this.loading = false;
        for (const dataLayer of this.dataLayers) {
          if (dataLayer.status === 'error') {
            this.failed = true;
          }
        }
      });
    }, 225);
    this.map.fitBounds(mapBounds);
  }

  onMapReady(map: Map) {
    this.map = map;
    setTimeout(() => {
      this.dataLayers.push(new IcampffLayer(this));
      this.activeLayers.push(this.dataLayers[0].name);
      this.dataLayers.push(new WaterQualityLayer(this));
      this.activeLayers.push(this.dataLayers[1].name);
      this.dataLayers.push(new WeatherStationLayer(this));
      this.dataLayers.push(new HydroMetereologicFactorsLayer(this));
      const promises: Promise<void>[] = [];
      for (const dataLayer of this.dataLayers) {
        if (this.activeLayers.indexOf(dataLayer.name) !== -1) {
          promises.push(dataLayer.add());
          this.layerSwitches.push(true);
        } else {
          dataLayer.status = 'off';
          this.layerSwitches.push(false);
        }
      }
      Promise.all(promises).then(() => {
        this.loading = false;
        for (const dataLayer of this.dataLayers) {
          if (dataLayer.status === 'error') {
            this.failed = true;
          }
        }
      });
    }, 225);
    this.fixMap();
  }

  fixMap() {
    this.mapStyle = {
      height: '100%',
      width: '100%'
    };
    this.map.invalidateSize();
  }
}
