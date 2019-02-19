import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { tileLayer, latLng, Map, Marker, DivIcon } from 'leaflet';

@Component({
  selector: 'app-get-lat-lng',
  templateUrl: './get-lat-lng.component.html',
  styleUrls: ['./get-lat-lng.component.scss']
})
export class GetLatLngComponent implements OnInit {
  @Input() coords: number[];
  @Output() update: EventEmitter<any> = new EventEmitter();
  map: Map;
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

  marker: Marker;

  constructor() {
    window.onresize = () => {
      if (this.map) {
        this.fixMap();
      }
    };
  }

  ngOnInit() {}

  onMapReady(m: Map) {
    this.map = m;
    this.map.on('click', (event: any) => {
      console.log(event.latlng.lat, event.latlng.lng);
      if (this.marker) {
        this.marker.removeFrom(this.map);
      }
      this.marker = new Marker(latLng(event.latlng.lat, event.latlng.lng), {
        icon: new DivIcon({
          className: 'xolonium',
          html: `
            <div class="container">
              <img
                style="
                  position: relative;
                  text-align: center;
                  color: white;"
                src="assets/glyph-marker-icon-gray.png"
              ></img>
            </div>
          `,
          iconSize: [24, 36],
          iconAnchor: [12, 36]
        }),
        title: 'Nuevo nodo'
      }).addTo(this.map);
      this.update.emit([event.latlng.lat, event.latlng.lng]);
    });
    if (this.coords) {
      this.marker = new Marker(latLng(this.coords[0], this.coords[1]), {
        icon: new DivIcon({
          className: 'xolonium',
          html: `
            <div class="container">
              <img
                style="
                  position: relative;
                  text-align: center;
                  color: white;"
                src="assets/glyph-marker-icon-gray.png"
              ></img>
            </div>
          `,
          iconSize: [24, 36],
          iconAnchor: [12, 36]
        }),
        title: 'Nuevo nodo'
      }).addTo(this.map);
    }
  }

  fixMap() {
    this.mapStyle = {
      height: `450px`,
      width: '100%'
    };
    this.map.invalidateSize();
  }
}
