import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ApiService } from '../api/api.service';
import { TranslateService } from '../translate/translate.service';
import { Node } from '../node';
import { Map, tileLayer,
         Marker, geoJSON } from 'leaflet';
import { glyphIcon } from '../glyph-icon';
import { NodeType } from '../node-type';
import { WaterBody } from '../water-body';
import { Sensor } from '../sensor';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, AfterViewInit {
  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec'];
  selectedNodeType: string = 'All stations';  // Which node types have to be displayed on the map
  nodes: Node[];  // The nodes pulled from the backend
  nodeTypes: NodeType[];  // The node types pulled from the backend
  map: Map;  // The leaflet map instance
  markers: Marker[] = [];  // A list of the markers on the map
  selectedWaterBody: WaterBody;  // The water body selected by the user
  screenWidth: number;  // The width (in pixels) of the window
  selectedLanguage: string = "En Español";
  selectedDateFormatted:string = "Latest";
  
  /* 
    The type has to be any because the geoJSON function only accepts
    this kind of object
  */
  waterBodies: WaterBody[];
  
  selectedNode: Node;  // The node selected by the user
  selectedNodeSensors: Sensor[];  // The sensors of the node selected by the user
  selectedDate: string = (new Date()).toISOString();
  placedWQNodes: string[];
  icamDates: string[] = [];
  
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

    this.selectedLanguage = this.translateService.getCurrentLanguage() != "en" ? "English":"Español";
  }

  /**
   * This function switches between the languages available for this application
   * 
   * @param language The language in which the app will be translated via the
   * translate service.
   */
  toggleLanguage() {
    this.translateService.selectLanguage(this.translateService.getCurrentLanguage() == "en"? "es":"en");
    this.selectedLanguage = this.translateService.getCurrentLanguage() != "en" ? "English":"Español";
    this.drawWaterBodies(this.selectedNodeType);
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
    var unit;

    this.selectedNodeSensors.forEach(sensor => {
      if (sensor.variable == variable) {
        unit = sensor.unit;
      }
    });

    this.dialog.open(Dialog, {
      width: '30%',
      height: '90%',
      minWidth: 300,
      minHeight: 300,
      data: [this.selectedNode._id, variable, unit]
    });
  }

  openDialog2() {
    this.dialog.open(Dialog, {
      width: '30%',
      height: '90%',
      minWidth: 300,
      minHeight: 300,
      data: [this.selectedWaterBody._id, 'icampff', '']
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
    if (this.screenWidth > 840) this.map.setView([10.4241961, -75.535], 13.5);
    else this.map.setView([10.4241961, -75.5084990], 13.5);
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
                                               () => this.drawWaterBodies(this.selectedNodeType))
  }

  selectNodeType(nt) {
    this.selectedNodeType = nt;
    this.selectDate(this.selectedDate);
  }

  selectDate(d) {
    this.selectedDate = d;
    var aux = new Date(Date.parse(this.selectedDate));
    this.selectedDateFormatted = aux.getFullYear() + "-" + this.translateService.translate(this.months[aux.getMonth()]) + "-" + aux.getDate() + " " + aux.getHours() + ":" + aux.getMinutes();
    var getColor = (icampff) => {
      return icampff > 90 ? '#0032FF' : // blue
              icampff > 70 ? '#49C502' : // green
                icampff > 50 ? '#F9F107' : // yellow
                  icampff > 25 ? '#F57702' : // orange
                    '#FB1502' ; // red
    }

    this.placedWQNodes = [];
    this.resetMarkers(this.selectedNodeType);
    this.icamDates = [];

    this.waterBodies.forEach(waterBody => {
      if (waterBody.properties.icamfs.length == 1 && waterBody.properties.icamfs[0].nodes.length == 0)
            return;
          waterBody.properties.icamfs.forEach(icam => {
            var found: boolean = false;

            var aux: Date = new Date(icam.date) 
            var nd: string = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate() + " " + aux.getHours() + ":" + aux.getMinutes();
            this.icamDates.forEach(icd => {
               
              if (icd == nd) {
                found = true;
                return;
              }
            });

            if (!found)
              this.icamDates.push(nd);
          });

          this.icamDates.sort((a: string, b: string) => {
            return (new Date(a)).getTime() - (new Date(b)).getTime();
          });

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
              click: highlight,
              tap: highlight,
              mouseout: resetHightlight
            });
          }

          var geojson: any = {
            type: waterBody.type,
            properties: waterBody.properties,
            geometry: waterBody.geometry
          }

          /**
           * USE THIS VARIABLES WHEN THE SELECTED DATE IS NOT THE LATEST AND
           * NONE OF THE DATES MATCH WITH THE SELECTED ONE.
           */
          var index: number = 0;
          var latestDateIndex: number = 0;
          var latestDate: Date = new Date("1/1/1900");
          
          waterBody.properties.icamfs.forEach(i => {
            if (latestDate < (new Date(i.date))) {
              latestDate = new Date(i.date);
              latestDateIndex = index;
            }
            index++;
          });

          index = 0;
          waterBody.properties.icamfs.forEach(i => {
            var aux: Date = new Date(i.date);
            var dt: string = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate() + " " + aux.getHours() + ":" + aux.getMinutes();
            if (dt == this.selectedDate) {
              geojson.properties.icam = i.icampff_avg;
              latestDateIndex = index;
              waterBody.selectedDate = aux.getDate() + "-" + this.translateService.translate(this.months[aux.getMonth()]) + "-" + aux.getFullYear();
              return;
            }
            index++;
          });

          if ("Water Quality" == this.selectedNodeType || this.selectedNodeType == 'All stations')
            waterBody.properties.icamfs[latestDateIndex].nodes.forEach(node => {
              var already_placed: boolean = false;
              
              this.placedWQNodes.forEach(nd => {
                if (nd == node) {
                  already_placed = true;
                  return;
                }
              });

              if (already_placed)
                return;

              var n: Node;

              this.nodes.forEach(nd => {
                if (node == nd._id) {
                  n = nd;
                  return;
                }
              });

              var ico_url: string;
              switch (n.status) {
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
                glyph: this.translateService.getCurrentLanguage() == "en" ? "WQ":"CA",
                iconUrl: ico_url
              });
              var marker = new Marker([n.coordinates[0], n.coordinates[1]], {title: n.name, icon: ico});
              
              marker.on('click', () => {
                this.selectedNode = n;
                this.nodeTypes.forEach(nodeType => {
                  if (nodeType._id == n.node_type_id)
                    this.selectedNodeSensors = nodeType.sensors
                });
              });
              
              marker.addTo(this.map);
              this.markers.push(marker);
              this.placedWQNodes.push(node);
            });
          
          var d: Date = new Date(waterBody.properties.icamfs[latestDateIndex].date);
          waterBody.selectedDate = d.getDate() + "-" + this.translateService.translate(this.months[d.getMonth()]) + "-" + d.getFullYear().toString();
          geojson.properties.icam = waterBody.properties.icamfs[latestDateIndex].icampff_avg;

          var wb = geoJSON(geojson, {
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
    });
  }

  /**
   * This fuction draws the water bodies into the map, but it also gives them
   * color, style and selectable behavior.
   */
  drawWaterBodies(type) {
    this.selectedNodeType = type;
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
    this.placedWQNodes = [];
    this.resetMarkers(this.selectedNodeType);
    this.icamDates = [];

    this.waterBodies.forEach(waterBody => {
      this.apiService.getICAMPff(waterBody._id).subscribe(
        icamfs => waterBody.properties.icamfs = icamfs, 
        () => console.log("failed to get the ICAMpff value for ", waterBody._id),
        () => {
          // Icam dates
          if (waterBody.properties.icamfs.length == 1 && waterBody.properties.icamfs[0].nodes.length == 0)
            return;
          waterBody.properties.icamfs.forEach(icam => {
            var found: boolean = false;

            var aux: Date = new Date(icam.date) 
            var nd: string = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate() + " " + aux.getHours() + ":" + aux.getMinutes();
            this.icamDates.forEach(icd => {
               
              if (icd == nd) {
                found = true;
                return;
              }
            });

            if (!found)
              this.icamDates.push(nd);
          });

          this.icamDates.sort((a: string, b: string) => {
            return (new Date(a)).getTime() - (new Date(b)).getTime();
          });

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
              click: highlight,
              tap: highlight,
              mouseout: resetHightlight
            });
          }

          var geojson: any = {
            type: waterBody.type,
            properties: waterBody.properties,
            geometry: waterBody.geometry
          }

          /**
           * USE THIS VARIABLES WHEN THE SELECTED DATE IS NOT THE LATEST AND
           * NONE OF THE DATES MATCH WITH THE SELECTED ONE.
           */
          var index: number = 0;
          var latestDateIndex: number = 0;
          var latestDate: Date = new Date("1/1/1900");
          
          waterBody.properties.icamfs.forEach(i => {
            if (latestDate < (new Date(i.date))) {
              latestDate = new Date(i.date);
              latestDateIndex = index;
            }
            index++;
          });

          index = 0;
          waterBody.properties.icamfs.forEach(i => {
            var aux: Date = new Date(i.date);
            var dt: string = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate() + " " + aux.getHours() + ":" + aux.getMinutes();
            if (dt == this.selectedDate) {
              geojson.properties.icam = i.icampff_avg;
              latestDateIndex = index;
              waterBody.selectedDate = aux.getDate() + "-" + this.translateService.translate(this.months[aux.getMonth()]) + "-" + aux.getFullYear();
              return;
            }
            index++;
          });

          if ("Water Quality" == this.selectedNodeType || this.selectedNodeType == 'All stations')
            waterBody.properties.icamfs[latestDateIndex].nodes.forEach(node => {
              var already_placed: boolean = false;
              
              this.placedWQNodes.forEach(nd => {
                if (nd == node) {
                  already_placed = true;
                  return;
                }
              });

              if (already_placed)
                return;

              var n: Node;

              this.nodes.forEach(nd => {
                if (node == nd._id) {
                  n = nd;
                  return;
                }
              });

              var ico_url: string;
              switch (n.status) {
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
                glyph: this.translateService.getCurrentLanguage() == "en" ? "WQ":"CA",
                iconUrl: ico_url
              });
              var marker = new Marker([n.coordinates[0], n.coordinates[1]], {title: n.name, icon: ico});
              
              marker.on('click', () => {
                this.selectedNode = n;
                this.nodeTypes.forEach(nodeType => {
                  if (nodeType._id == n.node_type_id)
                    this.selectedNodeSensors = nodeType.sensors
                });
              });
              
              marker.addTo(this.map);
              this.markers.push(marker);
              this.placedWQNodes.push(node);
            });
          
          var d: Date = new Date(waterBody.properties.icamfs[latestDateIndex].date);
          waterBody.selectedDate = d.getDate() + "-" + this.translateService.translate(this.months[d.getMonth()]) + "-" + d.getFullYear().toString();
          geojson.properties.icam = waterBody.properties.icamfs[latestDateIndex].icampff_avg;

          var wb = geoJSON(geojson, {
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
        });
    });
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
                                             () => this.getWaterBodies());
  }

  /**
   * If the map is ready to be used then it creates a marker
   * for each node using their coordinates.
   */
  setMarkers() {
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
      if ((nodeType == this.selectedNodeType || this.selectedNodeType == 'All stations') && nodeType !== "Water Quality") {
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