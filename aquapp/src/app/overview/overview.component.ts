import { Component, OnInit } from '@angular/core';
import {
  tileLayer,
  latLng,
  Map,
  geoJSON,
  FeatureGroup,
  Marker,
  DivIcon
} from 'leaflet';
import { ApiService } from '../api/api.service';
import { MessageService } from '../message/message.service';
import { IcampffAvg } from '../models/icampff-avg.model';
import { WaterBody } from '../models/water-body.model';
import { Node } from '../models/node.model';
import { UrlService } from '../url/url.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
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
  figures: FeatureGroup = new FeatureGroup();
  markers: Marker[];

  waterQualityVariables: string[];
  hydroMetereologicVariables: string[];
  weatherStationVariables: string[];

  waterBodies: WaterBody[] = [];
  icampffAvgsPerWaterBody: IcampffAvg[][] = [];

  nodes: Node[];
  selectedNodeType = 'Todas';
  nodeTypes = [
    {
      id: '59c9d9019a892016ca4be412',
      name: 'Water Quality'
    },
    {
      id: '59c9d9019a892016ca4be413',
      name: 'Hydro-Metereologic Factors'
    },
    {
      id: '5a16342a9a8920290056a542',
      name: 'Weather Station'
    }
  ];

  selectedDate = 'La más reciente disponible';
  icamDates: Date[];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private urlService: UrlService
  ) {
    window.onresize = () => {
      if (this.map) {
        this.fixMap();
      }
    };
  }

  ngOnInit() {}

  onMapReady(map: Map) {
    this.map = map;
    this.fixMap();
    this.getData();
  }

  fixMap() {
    this.mapStyle = {
      height: '100%',
      width: '100%'
    };
    this.map.invalidateSize();
  }

  async getData() {
    await this.apiService
      .getAllWaterBodies()
      .toPromise()
      .then(wbs => (this.waterBodies = wbs));
    for (const waterBody of this.waterBodies) {
      await this.apiService
        .getAllIcampff(waterBody.id)
        .toPromise()
        .then(ia => this.icampffAvgsPerWaterBody.push(ia));
    }
    await this.apiService
      .getAllNodes()
      .toPromise()
      .then(page => (this.nodes = page.items));
    if (
      this.nodes === undefined ||
      this.waterBodies === undefined ||
      this.icampffAvgsPerWaterBody === undefined
    ) {
      this.messageService.show('Error al cargar los datos, recargue la página');
      return;
    }
    this.icamDates = [];
    for (const icampffAvgs of this.icampffAvgsPerWaterBody) {
      for (const icampffAvg of icampffAvgs) {
        if (this.icamDates.indexOf(icampffAvg.date) === -1) {
          this.icamDates.push(icampffAvg.date);
        }
      }
    }
    this.addFigures();
  }

  addFigures(icampffDate: string = 'La más reciente disponible') {
    this.addMarkers();
    this.addWaterBodies(icampffDate);
  }

  addMarkers(nodeTypeId: string = '') {
    this.markers = [];
    for (const node of this.nodes) {
      if (nodeTypeId && nodeTypeId !== node.nodeTypeId) {
        continue;
      }
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

      let nodeTypeName: string;
      switch (node.nodeTypeId) {
        case '59c9d9019a892016ca4be412':
          nodeTypeName = 'WQ';
          break;
        case '59c9d9019a892016ca4be413':
          nodeTypeName = 'HF';
          break;
        default:
          nodeTypeName = 'WS';
          break;
      }

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
      const exportDataUrl: string = this.urlService.gen(
        ['formulario-exportar-datos'],
        {
          entity1Id: node.id,
          entity1Type: 'node'
        }
      );
      marker.bindPopup(`
        <h1>${node.name}</h1>
        <p>Ubicación: ${node.location}</p>
        <a href="${exportDataUrl}">Exportar datos</a>
      `);
      marker.addTo(this.map);
      this.markers.push(marker);
    }
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
      if (icampffDate === 'La más reciente disponible') {
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
          opacity: 1,
          dashArray: '',
          fillOpacity: 1,
          color: this.getColor(icampff)
        }
      });
      const exportDataUrl: string = this.urlService.gen(
        ['formulario-exportar-datos'],
        {
          entity1Id: waterBody.id,
          entity1Type: 'waterBody'
        }
      );
      geojson.eachLayer(layer => {
        layer.bindPopup(`
          <h1>${waterBody.name}</h1>
          <p>
            Valor del Icampff: ${
              icampff !== -1
                ? icampff.toFixed(2)
                : 'No disponible en la fecha seleccionada'
            }
          </p>
          <p>
            Fecha de la medición: ${new Date(
              this.icampffAvgsPerWaterBody[index][
                this.icampffAvgsPerWaterBody[index].length - 1
              ].date
            ).toDateString()}
          </p>
          <a href="${exportDataUrl}">Exportar datos</a>
        `);
        this.figures.addLayer(layer);
      });
      index++;
    }
    this.figures.addTo(this.map);
  }

  removeFigures() {
    this.removeMarkers();
    this.removeWaterBodies();
  }

  removeMarkers() {
    for (const marker of this.markers) {
      marker.removeFrom(this.map);
    }
    this.markers = [];
  }

  removeWaterBodies() {
    this.figures.getLayers().forEach(layer => {
      this.figures.removeLayer(layer);
    });
    this.figures.removeFrom(this.map);
    this.fixMap();
  }

  selectNodeType(nodeType: string) {
    let found = false;
    for (const nt of this.nodeTypes) {
      if (nt.id === nodeType) {
        found = true;
        this.selectedNodeType = nt.name;
        this.removeMarkers();
        this.addMarkers(nt.id);
        break;
      }
    }
    if (!found) {
      this.removeMarkers();
      this.addMarkers();
    }
  }

  selectDate(date: Date) {
    this.removeWaterBodies();
    this.addWaterBodies(date.toString());
    this.selectedDate = (new Date(date)).toDateString();
  }
}
