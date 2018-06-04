import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ApiService } from '../api/api.service';
import { TranslateService } from '../translate/translate.service';
import { Node } from '../node';
import { Map, tileLayer,
         featureGroup, FeatureGroup,
         GeoJSON, Control,
         Marker, geoJSON } from 'leaflet';
import { glyphIcon } from './glyph-icon';
import { NodeType } from '../node-type';
import { WaterBody } from '../water-body';
import { Sensor } from '../sensor';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, AfterViewInit {
  selectedNodeType: string = 'All';  // Which node types have to be displayed on the map
  nodes: Node[];  // The nodes pulled from the backend
  nodeTypes: NodeType[];  // The node types pulled from the backend
  map: Map;  // The leaflet map instance
  markers: Marker[] = [];  // A list of the markers on the map
  selectedWaterBody: WaterBody;  // The water body selected by the user
  screenWidth: number;  // The width (in pixels) of the window
  
  /* 
    The type has to be any because the geoJSON function only accepts
    this kind of object
  */
  waterBodies: any;
  
  mapReady: boolean = false;  // whether the map is ready for putting the markers on it or not 
  selectedNode: Node;  // The node selected by the user
  selectedNodeSensors: Sensor[];  // The sensors of the node selected by the user
  
  // The data that will be passed to the home component component [node_id, variable]
  data: string[] = ["node_id", "variable"];

  /**
   * 
   * @param apiService The api service connects to the backend and brings information
   * about the nodes and water bodies.
   * 
   * @param translateService This service translates text accross the app. (here is used
   * to translate the snackbar messages and to change the language of the app)
   * 
   * @param dialog An Angular Material Dialog instance used to display the export-selector
   * component
   * 
   * @param snackBar An angular Material SnackBar instance used to display error messages
   * (more info at: https://material.angular.io/components/snack-bar/overview)
   */
  constructor(private apiService: ApiService, private translateService: TranslateService, public dialog: MatDialog, public snackBar: MatSnackBar) { 
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
    
    // set screenWidth on screen size change and fixes the map size
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
      this.fixMap();
    };
  }

  /**
   * This function switches between the languages available for this application
   * 
   * @param language The language in which the app will be translated via the
   * translate service.
   */
  selectLanguage(language) {
    return this.translateService.selectLanguage(language);
  }

  /**
   * It opens the snackbar instance of this object and displays
   * a message (with an optional action)
   * More info at: https://material.angular.io/components/snack-bar/overview
   * 
   * @param message The message (here is used currently to display
   * error messages only) to be displayed
   * @param action The label for the snackbar action that the user 
   * can perform.
   */
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
  /**
   * Opens an Angular Material Dialog with the export selector in it with
   * the selected nodes id and variable as an array.
   * More information at: https://material.angular.io/components/dialog/overview
   * 
   * @param variable The variable which information the user wants to
   * export using the export-selector
   */
  openDialog(variable) {
    this.dialog.open(Dialog, {
      width: '30%',
      height: '90%',
      minWidth: 300,
      minHeight: 300,
      data: [this.selectedNode._id, variable]
    });
  }

  /**
   * After this component is loaded the map doesn't load properly,
   * to fix that we need to invalidate the size of the map.
   */
  ngAfterViewInit() {
    this.fixMap();
  }

  /**
   * This function invalidates the size of the map and also
   * sets its view to Cartagena.
   */
  fixMap() {
    this.map.invalidateSize();
    if (this.screenWidth > 840) this.map.setView([10.4061961, -75.4864990], 12);
    else this.map .setView([10.4061961, -75.5364990], 12);
  }

  /**
   * Once the component starts loading we create the map instance
   * an add a layer to it. It's also necessary to get the nodes
   * from the backend.
   */
  ngOnInit() {
    this.getNodes();
    this.map = new Map('mapid');
    
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      id: 'mapbox.streets'
    }).addTo(this.map);
  }

  /**
   * It gets the water bodies using the api service. If it fails then
   * displays an error message using the snackbar, otherwise it
   * draws the water bodies using the drawWaterBodies method.
   */
  getWaterBodies() {
    this.apiService.getWaterBodies().subscribe(waterBodies => this.waterBodies = waterBodies,
                                               () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
                                               () => this.drawWaterBodies())
  }

  /**
   * This fuction draws the water bodies into the map, but it also gives them
   * color, style and selectable behavior.
   */
  drawWaterBodies() {
    /**
     * Returns a color depending of the value of the icampff provided.
     * 
     * @param icampff The icampff value
     */
    var getColor = (icampff) => {
      return icampff > 90 ? '#0032FF' : // blue
              icampff > 70 ? '#49C502' : // green
                icampff > 50 ? '#F9F107' : // yellow
                  icampff > 25 ? '#F57702' : // orange
                    '#FB1502' ; // red
    }
    /**
     * For each water body we get its icampff value using the api service.
     * If the api service fails to get the value then a snackbar is opened
     * with an error message. If the operation was successful then
     * we set the style, highlight and clik events for that water body
     * and then add it to the map.
     */
    this.waterBodies.forEach(waterBody => {
      this.apiService.getICAMPff(waterBody._id).subscribe(icam => waterBody.properties.icam = icam, 
                                () => console.log("failed to get the ICAMpff value for ", waterBody._id),
                                () => {
                                  var highlight = (e) => {
                                    this.selectedWaterBody = waterBody;
                                    e.target.setStyle({
                                      weight: 2,
                                      opacity: 1,
                                      color: 'grey',
                                      dashArray: '',
                                      fillOpacity: 1
                                    });
                                  }

                                  var resetHightlight = (e) => {
                                    e.target.setStyle({
                                      weight: 2,
                                      opacity: 1,
                                      dashArray: '',
                                      fillOpacity: 1,
                                      color: getColor(e.target.feature.properties.icam)
                                    });
                                  }

                                  var onEachFeature = (feature, layer) => {
                                    layer.on({
                                      mouseover: highlight,
                                      mouseout: resetHightlight
                                    });
                                  }

                                  var wb = geoJSON(waterBody, {
                                    style: (feature) => {
                                      return {
                                        weight: 2,
                                        opacity: 1,
                                        dashArray: '',
                                        fillOpacity: 1,
                                        color: getColor(feature.properties.icam)
                                      };
                                    },
                                    onEachFeature: onEachFeature
                                  });

                                  wb.addTo(this.map);
                                })
    });
    this.mapReady = true;
  }

  /**
   * Takes the nodes from the backend using the api service. If
   * if fails then it opens a snackbar with the corresponding
   * error message, but if it doesn't fail then retreives the
   * node types with the getNodeTypes method.
   */
  getNodes() {
    this.apiService.getNodes().subscribe(nodes => this.nodes = nodes, 
                                         () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""), 
                                         () => this.getNodeTypes());
  }

  /**
   * Uses the api service to get the node types and then sets the
   * markers with the setMarkers method, if it fails then an
   * error message is displayed with the snackbar.
   */
  getNodeTypes() {
    this.apiService.getNodeTypes().subscribe(nodeTypes => this.nodeTypes = nodeTypes,
                                             () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
                                             () => this.setMarkers());
  }

  /**
   * If the map is ready to be used then it creates a marker
   * for each node using their coordinates.
   */
  setMarkers() {
    if (!this.mapReady)
      this.getWaterBodies();
    this.nodes.forEach(node => {
      // The text that is dispayed in the marker (WQ for the Water Quality nodes)
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
      if (nodeType == this.selectedNodeType || this.selectedNodeType == 'All') {
        marker.on('click', () => {
          this.selectedNode = node;
          this.nodeTypes.forEach(nodeType => {
            if (nodeType._id == node.node_type_id)
              this.selectedNodeSensors = nodeType.sensors
          });
        });
        marker.addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  /**
   * Deletes all the markers, sets the type of the nodes that
   * will be shown on the map an then sets the markers.
   * 
   * @param nodeType The type of node that will be displayed in the map
   */
  resetMarkers(nodeType: string) {
    this.selectedNodeType = nodeType;
    this.markers.forEach(marker => {
      marker.removeFrom(this.map);
    });
    this.markers = [];
    this.setMarkers();
  }

}

@Component({
  selector: 'dialog-component',
  templateUrl: './dialog.component.html',
})

export class Dialog {
  constructor(
    public dialogRef: MatDialogRef<Dialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  
  /**
   * When the user clicks outside the bounds of the Dialog
   * if closes.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }
}