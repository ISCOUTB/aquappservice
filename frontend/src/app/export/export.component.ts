import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Data } from '../sensor-data';
import { Node } from '../node';
import { NodeType } from '../node-type';
import { Sensor } from '../sensor';
import { WaterBody } from '../water-body';
import { ApiService } from '../api/api.service';
import { TranslateService } from '../translate/translate.service';
import { DateAdapter } from '@angular/material/core';
import { Icam } from '../water-body-property';
import { CSVData } from '../api/api.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css'],
})

export class ExportComponent implements OnInit {
  /**
   * Start and end of the date range that will be used
   * to get the data from the api.
   */
  startDate: Date;
  endDate: Date;

  loading: boolean = false;

  // For the second y-axis, if any
  startDate2: Date;
  endDate2: Date;

  // Whether there is a y-axis graph or not
  comparativeGraph: boolean = false;
  
  validDates2: string[];

  data2: Data;

  exportFormat: string;  // 'csv' or 'chart'

  sensors: Sensor[];
  secondNodeId: string;
  nodes: Node[];
  nodeTypes: NodeType[];
  variable: string;

  waterBodies: WaterBody[];

  // TODO: USE UNITS IN CSV
  unit: string;
  unit2: string;

  csv_data: CSVData;

  /**
   * A list of dates (with granularity of one day) in
   * which there is data collected
   */
  validDates: string[];

  /**
   * The id of the node which data will be exported
   * and the variable of the sensor.
   */
  @Input() dataFromHomeComponent: string[];

  // The data that will be exported
  data: Data;

  /**
   * 
   * @param apiService The api service connects to the backend and brings information
   * about the nodes and water bodies.
   * 
   * @param dialog An Angular Material Dialog instance used to display the export-selector
   * component
   * 
   * @param snackBar An angular Material SnackBar instance used to display error messages
   * (more info at: https://material.angular.io/components/snack-bar/overview)
   * 
   * @param translateService This service translates text accross the app. (here is used
   * to translate the snackbar messages)
   * 
   * @param adapter Used to change the locale of the date pickers to match with the page
   * current language.
   */
  constructor(private apiService: ApiService, public dialog: MatDialog, public snackBar: MatSnackBar, private translateService: TranslateService, private adapter: DateAdapter<any>) { }

  /**
   * When the component is rendered the valid dates are taken from the
   * backend. This method also changes the locale depending on the language
   * of the application.
   */
  ngOnInit() {
    
    this.apiService.getNodes().subscribe(nodes => this.nodes = nodes,
      () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
      () => {
        this.apiService.getNodeTypes().subscribe(nodeTypes => this.nodeTypes = nodeTypes,
          () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
          () => {
            this.secondNodeId = this.nodes[0]._id;
            this.nodeTypes.forEach(nodeType => {
              if (nodeType._id == this.nodes[0].node_type_id) {
                this.sensors = nodeType.sensors;
                return;
              }
            });

            this.variable = this.sensors[0].variable;
            this.getValidDates2();
            this.apiService.getWaterBodies().subscribe(wb => this.waterBodies = wb, () => {})
            this.getValidDates(this.dataFromHomeComponent[0], this.dataFromHomeComponent[1]);
          }
        );
      }
    );

    switch(this.translateService.getCurrentLanguage()) {
      case "en":
        this.adapter.setLocale("en-GB");
        break;
      case "es":
        this.adapter.setLocale("es-CO");
        break;
    }
  }

  getSensors() {
    var found: boolean = false;
    this.validDates2 = undefined;
    this.nodes.forEach(node => {
      if (node._id == this.secondNodeId) {
        found = true;
        this.nodeTypes.forEach(nodeType => {
          if (node.node_type_id == nodeType._id) {
            this.sensors = nodeType.sensors;
            return;
          }
        });
        return;
      }
    });

    if (!found) {
      this.sensors = [new Sensor("Icampff", "")];
    }
  }

  /**
   * Get the valid dates, displayes an error message if it fails
   */
  getValidDates(_id: string, variable: string) {
    var found: boolean = false;
    this.nodes.forEach(node => {
      if (node._id == this.dataFromHomeComponent[0]) {
        found = true;

        this.apiService.getValidDates(_id, variable).subscribe(validDates => this.validDates = validDates,
          () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""));

        return;
      }
    });
    if (!found) {
      var icampffs: Icam[] = [];
      this.apiService.getICAMPff(_id).subscribe(i => icampffs = i,
        () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
        () => {
          this.validDates = [];
          icampffs.forEach(icam => {
            var d: Date = new Date(icam.date);
            this.validDates.push((d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear());
          });
        }
      );
    }
  }

  getValidDates2() {
    this.validDates2 = undefined;
    var found: boolean = false;

    this.nodes.forEach(node => {
      if (node._id == this.secondNodeId) {
        found = true;
        return;
      }
    });

    if (found)
      this.apiService.getValidDates(this.secondNodeId, this.variable).subscribe(validDates => this.validDates2 = validDates,
        () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""));
    else {
      var icampffs: Icam[] = [];
      this.apiService.getICAMPff(this.secondNodeId).subscribe(i => icampffs = i,
        () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
        () => {
          this.validDates2 = [];
          icampffs.forEach(icam => {
            var d: Date = new Date(icam.date);
            this.validDates2.push((d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear());
          });
        }
      )
    }
  }

  /**
   * Exports the data in csv or as a chart using dygraphs
   * (more info at http://dygraphs.com/)
   */
  export() {
    this.loading = true;
    if (this.comparativeGraph) {
      if (this.exportFormat == 'csv') {
        // Convert JSON to csv and download
        var found: boolean = false;
        this.nodes.forEach(node => {
          if (node._id == this.dataFromHomeComponent[0]) {
            found = true;
            this.apiService.getCSVData2(
              this.dataFromHomeComponent[0],
              this.dataFromHomeComponent[1],
              this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
              this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate(),
              this.secondNodeId,
              this.variable,
              this.startDate2.getFullYear() + "-" + (this.startDate2.getMonth() + 1) + "-" + this.startDate2.getDate(),
              this.endDate2.getFullYear() + "-" + (this.endDate2.getMonth() + 1) + "-" + this.endDate2.getDate()
            ).subscribe(csv_data => this.csv_data = csv_data, () => {},
              () => {
                var blob = new Blob([this.csv_data.csv], {type: 'text/csv'});
                var url= window.URL.createObjectURL(blob);
                window.open(url);
                this.loading = false;
              }
            )
            return;
          }
        });
        if (!found) {
          this.apiService.getCSVData4(
            this.dataFromHomeComponent[0],
            this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
            this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate(),
            this.secondNodeId,
            this.variable,
            this.startDate2.getFullYear() + "-" + (this.startDate2.getMonth() + 1) + "-" + this.startDate2.getDate(),
            this.endDate2.getFullYear() + "-" + (this.endDate2.getMonth() + 1) + "-" + this.endDate2.getDate()
          ).subscribe(csv_data => this.csv_data = csv_data, () => {},
            () => {
              var blob = new Blob([this.csv_data.csv], {type: 'text/csv'});
              var url= window.URL.createObjectURL(blob);
              window.open(url);
              this.loading = false;
            }
          )
        }
      } else {
        var found: boolean = false;
        // Open popup
        this.nodes.forEach(node => {
          if (node._id == this.dataFromHomeComponent[0]) {
            found = true;
            this.apiService.getCSVData2(
              this.dataFromHomeComponent[0],
              this.dataFromHomeComponent[1],
              this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
              this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate(),
              this.secondNodeId,
              this.variable,
              this.startDate2.getFullYear() + "-" + (this.startDate2.getMonth() + 1) + "-" + this.startDate2.getDate(),
              this.endDate2.getFullYear() + "-" + (this.endDate2.getMonth() + 1) + "-" + this.endDate2.getDate()
            ).subscribe(csv_data => this.csv_data = csv_data,
              () => {},
              () => {
                this.loading = false;
                this.openDialog2();
              }
            )
            return;
          }
        });
        if (!found)
          this.apiService.getCSVData4(
            this.dataFromHomeComponent[0],
            this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
            this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate(),
            this.secondNodeId,
            this.variable,
            this.startDate2.getFullYear() + "-" + (this.startDate2.getMonth() + 1) + "-" + this.startDate2.getDate(),
            this.endDate2.getFullYear() + "-" + (this.endDate2.getMonth() + 1) + "-" + this.endDate2.getDate()
          ).subscribe(csv_data => this.csv_data = csv_data,
            () => {},
            () => {
              this.loading = false;
              this.openDialog2();
            }
          );
      }
    } else {
      if (this.exportFormat == 'csv') {
        // Convert JSON to csv and download
        var found: boolean = false;
        this.nodes.forEach(node => {
          if (node._id == this.dataFromHomeComponent[0]) {
            found = true;

            this.apiService.getCSVData1(
              this.dataFromHomeComponent[0],
              this.dataFromHomeComponent[1],
              this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
              this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate()
            ).subscribe(csv_data => this.csv_data = csv_data, () => {},
              () => {
                var blob = new Blob([this.csv_data.csv], {type: 'text/csv'});
                var url= window.URL.createObjectURL(blob);
                window.open(url);
                this.loading = false;
              }
            )

            return;
          }
        });

        if (!found) {
          this.apiService.getCSVData3(
            this.dataFromHomeComponent[0],
            this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
            this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate()
          ).subscribe(csv_data => this.csv_data = csv_data, () => {},
            () => {
              var blob = new Blob([this.csv_data.csv], {type: 'text/csv'});
              var url= window.URL.createObjectURL(blob);
              window.open(url);
              this.loading = false;
            }
          )
        }
        
      } else {
        // Open popup
        var found: boolean = false;
        this.nodes.forEach(node => {
          if (node._id == this.dataFromHomeComponent[0]) {
            found = true;

            this.apiService.getCSVData1(
              this.dataFromHomeComponent[0],
              this.dataFromHomeComponent[1],
              this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
              this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate()
            ).subscribe(csv_data => this.csv_data = csv_data, () => {},
              () => {
                this.loading = false;
                this.openDialog();
              }
            );

            return;
          }
        });

        if (!found) {
          this.apiService.getCSVData3(
            this.dataFromHomeComponent[0],
            this.startDate.getFullYear() + "-" + (this.startDate.getMonth() + 1) + "-" + this.startDate.getDate(),
            this.endDate.getFullYear() + "-" + (this.endDate.getMonth() + 1) + "-" + this.endDate.getDate()
          ).subscribe(csv_data => this.csv_data = csv_data, () => {},
            () => {
              this.loading = false;
              this.openDialog();
            }
          );
        }
      }
    }
  }

  /**
   * Opens the Dialog instance with the data to export that
   * will be used in the ng-dygraph directive in 
   * export-selector.component.html.
   */
  openDialog(): void {
    var node1: string;
    this.unit = "";
    var sensor1: string;
    this.nodes.forEach(node => {
      if (node._id == this.dataFromHomeComponent[0]) {
        node1 = node.name;
        this.nodeTypes.forEach(nodeType => {
          if (nodeType._id == node.node_type_id) {
            nodeType.sensors.forEach(sensor => {
              if (sensor.variable == this.dataFromHomeComponent[1]) {
                this.unit = sensor.unit;
                sensor1 = sensor.variable;
                return;
              }
            });
          }
        });
        return;
      }
    });

    if (node1 == undefined)
      this.waterBodies.forEach(waterBody => {
        if (waterBody._id == this.dataFromHomeComponent[0]) {
          node1 = waterBody.properties.name;
          sensor1 = "ICAMpff";
          return;
        }
      });
    
    this.dialog.open(Dialog, {
      width: '70%',
      height: '70%',
      minHeight: "300px",
      data: {
        'node_id': this.dataFromHomeComponent[0], 
        'variable': this.dataFromHomeComponent[1],
        'sensor_data': this.csv_data.csv,
        'options': {
          'dateWindow': [(new Date(this.csv_data.minDate)).getTime() - 3600 * 24 * 30 * 1000, (new Date(this.csv_data.maxDate)).getTime() + 3600 * 24 * 30 * 1000],
          'pointSize': 2.5,
          'highlightCircleSize': 5.0,
          'drawPoints': true,
          'strokeWidth': 0.0,
          'displayAnnotations': true,
          'width': 1000,
          'height': 250,
          'legend': 'always',
          'ylabel': this.translateService.translate(sensor1) + (this.unit? " (" + this.unit + ")": ""),
          'xlabel': this.translateService.translate('Date'),
          'axes': {
            y: {
              valueFormatter: (v) => {
                return v;  // controls formatting in the legend/mouseover
              },
              axisLabelFormatter: (v) => {
                return v;  // controls formatting of the y-axis labels
              }
            }
          },
          labels: ["Date", node1 + (this.unit != "" ?" (" + this.unit + ")" : "")]
        }
      }
    });
  }

  // When there's a second variable
  openDialog2(): void {
    this.unit2 = "";
    var sensor1: string;
    var sensor2: string;
    var node2: string;
    var node1: string;
    
    this.nodes.forEach(node => {
      if (node._id == this.secondNodeId) {
        node2 = node.name;
        this.nodeTypes.forEach(nodeType => {
          if (nodeType._id == node.node_type_id) {
            nodeType.sensors.forEach(sensor => {
              if (sensor.variable == this.variable) {
                this.unit2 = sensor.unit;
                sensor2 = sensor.variable;
                return;
              }
            });
          }
        });
        return;
      }
    });

    if (node2 == undefined)
      this.waterBodies.forEach(waterBody => {
        if (waterBody._id == this.secondNodeId) {
          node2 = waterBody.properties.name;
          sensor2 = "ICAMpff";
          return;
        }
      });
    
    this.unit = ""
    this.nodes.forEach(node => {
      if (node._id == this.dataFromHomeComponent[0]) {
        node1 = node.name;
        this.nodeTypes.forEach(nodeType => {
          if (nodeType._id == node.node_type_id) {
            nodeType.sensors.forEach(sensor => {
              if (sensor.variable == this.dataFromHomeComponent[1]) {
                this.unit = sensor.unit;
                sensor1 = sensor.variable;
                return;
              }
            });
          }
        });
        return;
      }
    });

    if (node1 == undefined)
      this.waterBodies.forEach(waterBody => {
        if (waterBody._id == this.dataFromHomeComponent[0]) {
          node1 = waterBody.properties.name;
          sensor1 = "ICAMpff";
          return;
        }
      });
    
    this.dialog.open(Dialog, {
      width: '70%',
      height: '70%',
      minHeight: "300px",
      data: {
        'node_id': this.dataFromHomeComponent[0], 
        'variable': this.dataFromHomeComponent[1],
        'sensor_data': this.csv_data.csv,
        'options': {
          'dateWindow': [(new Date(this.csv_data.minDate)).getTime() - 3600 * 24 * 30 * 1000, (new Date(this.csv_data.maxDate)).getTime() + 3600 * 24 * 30 * 1000],
          'drawPoints': true,
          'pointSize': 2.5,
          'highlightCircleSize': 5.0,
          'strokeWidth': 0.0,
          'displayAnnotations': true,
          'width': 1000,
          'height': 250,
          'legend': 'always',
          'ylabel': this.translateService.translate(sensor1) + (this.unit? "(" + this.unit + ")" : "") + (this.unit != this.unit2? (" vs " + this.translateService.translate(sensor2) + (this.unit2 != ""? "(" + this.unit2 + ")": "")) : ""),
          'xlabel': this.translateService.translate('Date'),
          'axes': {
            y: {
              valueFormatter: (v) => {
                return v;  // controls formatting in the legend/mouseover
              },
              axisLabelFormatter: (v) => {
                return v;  // controls formatting of the y-axis labels
              }
            },
            y1: {
              valueFormatter: (v) => {
                return v;  // controls formatting in the legend/mouseover
              },
              axisLabelFormatter: (v) => {
                return v;  // controls formatting of the y-axis labels
              }
            }
          },
          labels: ["Date", node1 + (this.unit != "" ?" (" + this.unit + ")" : ""), node2 + (this.unit2 != "" ?" (" + this.unit2 + ")" : "")],
          colors: ["#007ee5ff", "#0028c0ff"]
        }
      }
    });
  }
  
  /**
   * This object was created with the sole purpose of taking
   * advantage of the TypeScript scope of the variables.
   * 
   * To filter the dates in the date pickers we need a
   * callback that checks a given date and returns
   * true if the date is valid and false if not.
   * The big problem is that the filter function needs
   * the validDates property from ExportSelectorComponent,
   * but the 'this' pointer no longers
   * points to ExportSelectorComponent but to the
   * datepicker instance, so, the solution was to
   * wrap the filter callback into this object that
   * has the validDates property from this component,
   * this way, the 'this' pointer in dateFilter refers 
   * to the filter property of this component instead 
   * of the datepicker.
   */
  filter = {
    'validDates': this.validDates,
    'dateFilter': (d: Date): boolean => {
      var date_as_string: string = (d.getMonth() + 1).toString() + "/" + d.getDate().toString() + "/" + d.getFullYear().toString();
      var result = false;
      this.validDates.forEach(valid_date => {
        if (valid_date == date_as_string) {
          result = true;
          return;
        }
      });

      return result;
    }
  }

  filter2 = {
    'validDates': this.validDates2,
    'dateFilter': (d: Date): boolean => {
      var date_as_string: string = (d.getMonth() + 1).toString() + "/" + d.getDate().toString() + "/" + d.getFullYear().toString();
      var result = false;
      this.validDates2.forEach(valid_date => {
        if (valid_date == date_as_string) {
          result = true;
          return;
        }
      });

      return result;
    }
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

  expand() {
    this.dialogRef.updateSize("90%", "90%");
  }
  
  reduce() {
    this.dialogRef.updateSize("70%", "70%")
  }
}
