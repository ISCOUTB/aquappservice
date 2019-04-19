import { Component, OnInit, Input } from '@angular/core';
import { tileLayer, latLng, Map, geoJSON, FeatureGroup } from 'leaflet';
import { MessageService } from 'src/app/modules/utils/message/services/message/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import { WaterBody } from 'src/app/modules/aquapp/models/water-body.model';

@Component({
  selector: 'app-edit-water-body-page',
  templateUrl: './edit-water-body-page.component.html',
  styleUrls: ['./edit-water-body-page.component.scss']
})
export class EditWaterBodyPageComponent implements OnInit {
  loading = true;
  failed = false;
  geojson: any;
  name: string;
  id: string;
  nodes: string[];
  redirectTo: string;
  importedData: string;

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
    height: `450px`,
    width: '100%'
  };

  map: Map;

  figures: FeatureGroup = new FeatureGroup();
  mapDrawOptions: any = {
    edit: {
      featureGroup: this.figures,
      position: 'topright'
    },
    draw: {
      rectangle: false,
      circle: false,
      marker: false,
      circlemarker: false
    }
  };

  constructor(
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) {
    window.onresize = () => {
      this.fixMap();
    };
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.apiService.getAWaterBody(params['id']).subscribe(
        wb => {
          this.name = wb.name;
          this.nodes = wb.nodes;
          this.geojson = wb.geojson;
          this.id = wb.id;
          this.loading = false;
        },
        () => {
          this.loading = false;
          this.failed = true;
        }
      );
    });
  }

  onMapReady(m: Map) {
    this.map = m;
    this.fixMap();
    this.addFigures();
  }

  fixMap() {
    this.mapStyle = {
      height: `450px`,
      width: '100%'
    };
    this.map.invalidateSize();
  }

  addImmutableFigure(geojson: string, color: string = 'black') {
    this.map.addLayer(
      geoJSON(JSON.parse(geojson), {
        style: {
          color: color
        }
      })
    );
  }

  addFigures() {
    const figures = this.figures;
    this.map.on('draw:created', (e: any) => {
      // Each time a feaute is created, it's added to the over arching feature group
      if (figures.getLayers().length) {
        this.messageService.show('Solo se permite una unica figura');
        return;
      }
      figures.addLayer(e.layer);
    });

    const geojson = geoJSON(JSON.parse(this.geojson));
    geojson.eachLayer(layer => {
      figures.addLayer(layer);
    });

    figures.addTo(this.map);

    this.centerMap();
  }

  centerMap() {
    const figures: any = this.figures.toGeoJSON();
    if (figures.features.length) {
      this.map.fitBounds(this.figures.getBounds());
    }
  }

  removeFigures() {
    this.figures.getLayers().forEach(layer => {
      this.figures.removeLayer(layer);
    });
    this.figures.removeFrom(this.map);
  }

  save() {
    const figure: any = this.figures.toGeoJSON();
    if (!figure.features.length) {
      this.messageService.show('Debe proporcionar una figura');
      return;
    }
    const wb = new WaterBody();
    wb.name = this.name;
    wb.id = this.id;
    wb.geojson = JSON.stringify(figure.features[0]);
    wb.nodes = this.nodes;
    this.apiService.editWaterBody(wb).subscribe(() => {
      this.messageService.show('Cambios guardados');
      this.location.back();
    });
  }

  redirect() {
    if (this.redirectTo) {
      this.router.navigateByUrl(this.redirectTo);
    }
  }

  export() {
    const figure: any = this.figures.toGeoJSON();
    const blob = new Blob([JSON.stringify(figure.features[0])], {
      type: 'text/json'
    });
    saveAs(blob, this.name + '.json');
  }

  import() {
    this.removeFigures();
    this.geojson = atob(this.importedData.slice(29));
    this.addFigures();
  }
}
