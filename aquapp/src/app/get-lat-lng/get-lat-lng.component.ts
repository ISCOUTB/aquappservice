import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { tileLayer, latLng, Map, map, Marker, Icon } from 'leaflet';

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
        icon: new Icon({
          iconSize: [25, 41],
          iconAnchor: [13, 0],
          iconUrl: '/assets/marker-icon.png',
          shadowUrl: '/assets/marker-shadow.png'
        }),
        title: 'Nuevo nodo'
      }).addTo(this.map);
      this.update.emit([event.latlng.lat, event.latlng.lng]);
    });
  }

  fixMap() {
    this.mapStyle = {
      height: `450px`,
      width: '100%'
    };
    this.map.invalidateSize();
  }
}
