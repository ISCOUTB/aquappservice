import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ApiService } from '../api/api.service';
import { TranslateService } from '../translate/translate.service';
import { NodeType } from '../node-type';
import { WaterBody } from '../water-body';
import { Node } from '../node';
import { Sensor } from '../sensor';
import { Map, tileLayer,
  featureGroup, FeatureGroup,
  GeoJSON, Control,
  Marker, geoJSON } from 'leaflet';
import { glyphIcon } from '../glyph-icon';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  screenWidth: number;
  map: Map;
  nodeTypes: NodeType[];
  nodes: Node[];
  waterBodies: any;
  selectedWaterBody: WaterBody;
  markers: Marker[] = [];
  mapReady: boolean;
  selectedNode: Node;
  selectedNodeSensors: Sensor[];
  apiToken: string;

  variable: string;
  date: Date;
  value: number;
  hour: string;

  newNodeName: string = "";
  newNodeLocation: string = "";
  newNodeStatus: string = "Off";
  newNodeType: string = "";
  newNodeLat: number = 0;
  newNodeLng: number = 0;

  dateFilter: any = (d: Date) => {
    return d <= new Date();
  }

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

    // set screenWidth on screen size
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
      this.fixMap();
    };
   }

  ngOnInit() {
    this.getNodes();
    this.map = new Map('mapid');

    var wrapper: any = {
      'newNodeLat': this.newNodeLat,
      'newNodeLng': this.newNodeLng,
      func: (e: any) => {
        this.newNodeLat = e.latlng.lat;
        this.newNodeLng = e.latlng.lng;
      }
    }

    this.map.on('click', wrapper.func);
    
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      id: 'mapbox.streets'
    }).addTo(this.map);
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

  selectLanguage(language) {
    this.translateService.selectLanguage(language);
    this.resetMarkers();
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
  openSnackBar(message: string, action: string, obj?: any, f?: string) {
    if (f !== undefined && obj !== undefined)
      this.snackBar.open(message, action, {
        duration: 2000,
      }).afterDismissed().subscribe((matDismiss) => {
        if (matDismiss.dismissedByAction)
          obj[f]();
      });
    else this.snackBar.open(message, action, {duration: 2000});
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
                                             () => this.resetMarkers());
  }

  /**
   * Deletes all the markers, and creates them again
   * with setMarkers (useful when needing to show
   * new changes)
   */
  resetMarkers() {
    this.markers.forEach(marker => {
      marker.removeFrom(this.map);
    });
    this.markers = [];
    this.setMarkers();
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
          acronym = this.translateService.translate(nt.name).toUpperCase().split(' ');
          if (acronym.length == 3)
            acronym = [acronym[0], acronym[2]];
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
      marker.on('click', () => {
        this.selectedNode = node;
        
        this.nodeTypes.forEach(nodeType => {
          if (nodeType._id == node.node_type_id)
            this.selectedNodeSensors = nodeType.sensors
        });
      });
      marker.addTo(this.map);
      this.markers.push(marker);
      
    });
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
   * Opens an Angular Material Dialog
   * More information at: https://material.angular.io/components/dialog/overview
   * 
   * @param variable The variable which information the user wants to
   * export using the export-selector
   */
  authenticate() {
    let dialogRef = this.dialog.open(Dialog, {
      width: '30%',
      height: '30%',
      minWidth: 240,
      maxWidth: 240,
      minHeight: 340,
      maxHeight: 340
    });
    dialogRef.afterClosed().subscribe(result => {
      this.apiToken = result;
    });
  }

  update() {
    this.apiService.editNode(
      this.apiToken,
      this.selectedNode._id,
      this.selectedNode.name,
      this.selectedNode.location,
      this.selectedNode.coordinates,
      this.selectedNode.status,
      this.selectedNode.node_type_id
    ).subscribe(
      result => { 
        this.openSnackBar(this.translateService.translate('Node updated successfully'), '');
        this.getNodes();
      },
      () => this.openSnackBar(this.translateService.translate('Failed to update the node, check your connection'), '')
    );
  }

  create() {
    this.apiService.createNode(
      this.apiToken,
      this.newNodeName,
      this.newNodeLocation,
      [this.newNodeLat, this.newNodeLng],
      this.newNodeStatus,
      this.newNodeType
    ).subscribe(
      result => {
        this.openSnackBar(this.translateService.translate('Node created successfully'), '');
        this.getNodes();
      },
      () => this.openSnackBar(this.translateService.translate('Failed to create the node, check your connection'), '')
    );
  }

  confirmDeletion() {
    this.openSnackBar(this.translateService.translate('Are you sure you want to delete?'), this.translateService.translate('delete'), this, "delete");
  }

  addData() {
    this.apiService.addData(
      this.apiToken, 
      this.variable, 
      this.date.getFullYear().toString() + "/" + 
        (this.date.getMonth() + 1).toString() + "/" + 
        (this.date.getDay() + 1).toString() + 
        " " + 
        this.hour, 
      this.value, 
      this.selectedNode._id).subscribe(
        () => {

        },
        () => {
          this.openSnackBar(this.translateService.translate("Error adding the data, check your connection"), "");
        },
        () => {
          this.openSnackBar(this.translateService.translate("Data added successfully"), "");
        });
  }

  delete() {
    this.apiService.deleteNode(
      this.apiToken,
      this.selectedNode._id
    ).subscribe(
      result => {
        this.openSnackBar(this.translateService.translate('Node deleted successfully'), '');
        this.getNodes();
        this.selectedNode = undefined;
      },
      () => this.openSnackBar(this.translateService.translate('Failed to delete the node, check your connection'), '') 
    )
  }
}

@Component({
  selector: 'dialog-component',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})

export class Dialog {
  token: string;
  username: string;
  password: string;

  constructor(
    public dialogRef: MatDialogRef<Dialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService) {
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
  
  login() {
    this.apiService.login(this.username, this.password).subscribe(response => this.token = response.TOKEN? response.TOKEN:this.token,
        () => this.openSnackBar(this.translateService.translate('Failed to login'), ''),
        () => {
          if (this.token !== undefined) {
            this.onNoClick();
            this.openSnackBar(this.translateService.translate('Login successful', ), '');
          }
        }
      );
  }
  /**
   * When the user clicks outside the bounds of the Dialog
   * if closes.
   */
  onNoClick() {
    this.dialogRef.close(this.token);
  }
}