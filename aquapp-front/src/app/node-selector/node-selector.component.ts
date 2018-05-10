import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { ApiService } from '../api/api.service';
import { Node } from '../node';
import { Map, TileLayer, tileLayer, 
         featureGroup, FeatureGroup, 
         GeoJSON, geoJSON, Browser, 
         Control, Marker,
         Icon, DivIcon } from 'leaflet';
import { glyphIcon } from './glyph-icon';
import { waterBodiesData } from './map-data';
import { NodeType } from '../node-type';

@Component({
  selector: 'app-node-selector',
  templateUrl: './node-selector.component.html',
  styleUrls: ['./node-selector.component.css']
})

export class NodeSelectorComponent implements OnInit {
  selected_node_type: string = 'all';
  node_types: string[] = ['Water Quality', 'Hydro-Meteorologic Factors', 'Weather Station', 'all'];
  // use_date_range: boolean;
  // min_date: Date = new Date(2016, 0, 1);
  // max_date: Date = new Date();
  // start_d: Date;
  // end_d: Date;
  // @ViewChild(MatDatepicker) start_date: MatDatepicker<Date>;
  // @ViewChild(MatDatepicker) end_date: MatDatepicker<Date>;
  nodes: Node[];
  nodeTypes: NodeType[];
  map: Map;
  markers: Marker[] = [];
  screenWidth: number;
  
  constructor(private apiService: ApiService) { 
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      // set screenWidth on screen size change
      this.screenWidth = window.innerWidth;
    };
  }

  ngOnInit() {
    this.getNodes();
    this.map = new Map('mapid').setView([10.3861961, -75.4364990], 12);
    
    tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this.map);

    var getColor = (d) => {
      return d > 90 ? '#0032FF' : // blue
              d > 70 ? '#49C502' : // green
                d > 50 ? '#F9F107' : // yellow
                  d > 25 ? '#F57702' : // orange
                    '#FB1502' ; // red
    }

    var waterBodies:GeoJSON = geoJSON(waterBodiesData, {
        style: (feature) => {
          return {color: getColor(feature.properties.icam)};
        }
      }
    ).bindPopup((layer) => {
      return layer.getAttribution();
    }).addTo(this.map);
    
    /**
     *  var ico = new DivIcon({
      html: '<img class="xolonium" src="assets/glyph-marker-icon-blue.png"/>'+
            '<span class="xolonium">WS</span>'
    });
     */
  }

  getNodes(): void {
    this.apiService.getNodes().subscribe(nodes => this.nodes = nodes, 
                                         () => console.log("node-selector: Couldn't get the nodes"), 
                                         () => this.getNodeTypes());
  }

  getNodeTypes(): void {
    this.apiService.getNodeTypes().subscribe(nodeTypes => this.nodeTypes = nodeTypes,
                                             () => console.log("node-selector: Couldn't get the node types"),
                                             () => this.setMarkers());
  }

  setMarkers(): void {
    this.nodes.forEach(node => {
      var acronym: string[] = ["E", "E"];
      var nodeType: string;
      this.nodeTypes.forEach(nt => {
        if (nt._id == node.node_type_id) {
          acronym = nt.name.split(' ');
          nodeType = nt.name;
        }
      });
      
      var ico_url: string;
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

      var ico = glyphIcon({
        className: 'xolonium',
        glyph: acronym[0][0] + acronym[1][0],
        iconUrl: ico_url
      });

      var marker = new Marker([node.coordinates[0], node.coordinates[1]], {title: node.name, icon: ico});
      if (nodeType == this.selected_node_type || this.selected_node_type == 'all') {
        marker.addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  resetMarkers(): void {
    console.log('Resetting markers...');
    this.markers.forEach(marker => {
      marker.removeFrom(this.map);
    });
    this.markers = [];
    this.setMarkers();
  }

}
