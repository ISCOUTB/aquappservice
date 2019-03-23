import { Component, OnInit, Input } from '@angular/core';
import { tileLayer, latLng, Map, geoJSON, FeatureGroup } from 'leaflet';
import { MessageService } from 'src/app/services/message/message.service';

@Component({
  selector: 'app-edit-water-body-dialog',
  templateUrl: './edit-water-body-dialog.component.html',
  styleUrls: ['./edit-water-body-dialog.component.scss']
})
export class EditWaterBodyDialogComponent implements OnInit {
  @Input() geojson: any;
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
    height: '400px',
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

  constructor(private messageService: MessageService) {
    window.onresize = () => {
      this.fixMap();
    };
  }

  ngOnInit() {}

  onMapReady(map: Map) {
    this.map = map;
    this.fixMap();
    this.addFigures();
  }

  fixMap() {
    this.mapStyle = {
      height: '400px',
      width: '100%'
    };
    this.map.invalidateSize();
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

    if (this.geojson) {
      figures.addLayer(geoJSON(this.geojson, {}));
    }
    figures.addTo(this.map);
  }

  removeFigures() {
    this.figures.getLayers().forEach(layer => {
      this.figures.removeLayer(layer);
    });
    this.fixMap();
  }

  import() {
    this.removeFigures();
    this.geojson = JSON.parse(atob(this.importedData.slice(29)));
    this.addFigures();
  }
}
