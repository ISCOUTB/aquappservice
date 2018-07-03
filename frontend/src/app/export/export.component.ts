import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Data } from '../sensor-data';
import { Node } from '../node';
import { NodeType } from '../node-type';
import { Sensor } from '../sensor';
import { ApiService } from '../api/api.service';
import { TranslateService } from '../translate/translate.service';
import { DateAdapter } from '@angular/material/core';

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

  // TODO: USE UNITS IN CSV
  unit: string;
  unit2: string;

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
            this.getValidDates2(this.secondNodeId, this.variable);
          }
        );
      }
    );

    this.getValidDates(this.dataFromHomeComponent[0], this.dataFromHomeComponent[1]);
    switch(this.translateService.getCurrentLanguage()) {
      case "en":
        this.adapter.setLocale("en-GB");
        break;
      case "es":
        this.adapter.setLocale("es-CO");
        break;
    }
  }

  /**
   * Get the valid dates, displayes an error message if it fails
   */
  getValidDates(_id: string, variable: string) {
    this.apiService.getValidDates(_id, variable).subscribe(validDates => this.validDates = validDates,
      () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""));
  }

  getValidDates2(_id: string, variable: string) {
    this.apiService.getValidDates(_id, variable).subscribe(validDates => this.validDates2 = validDates,
      () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""));
  }

  /**
   * Takes the data from the backend or displays an error message if
   * not alll the fields were filled.
   */
  getData() {
    if (this.startDate === undefined || 
        this.endDate === undefined || 
        this.exportFormat === undefined) {
      this.openSnackBar(this.translateService.translate("Invalid input, make sure to fill all the fields"), '')
      return;
    }
    this.apiService.getNodeData(this.dataFromHomeComponent[0], this.startDate, this.endDate, this.dataFromHomeComponent[1]).subscribe(data => this.data = data, 
      () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
      () => this.export());
  }

  getSecondData() {
    if (this.startDate === undefined || 
        this.endDate === undefined || 
        this.exportFormat === undefined) {
      this.openSnackBar(this.translateService.translate("Invalid input, make sure to fill all the fields"), '')
      return;
    }

    this.apiService.getNodeData(this.secondNodeId, this.startDate2, this.endDate2, this.variable).subscribe(data2 => this.data2 = data2, 
      () => this.openSnackBar(this.translateService.translate("Failed to fetch the data, check your internet connection"), ""),
      () => this.export2());
  }

  /**
   * Exports the data in csv or as a chart using dygraphs
   * (more info at http://dygraphs.com/)
   */
  export() {
    if (this.comparativeGraph) {
      this.getSecondData();
      return;
    }

    if (this.exportFormat == 'csv') {
      // Convert JSON to csv and download
      var data:string = "";
      this.data.data.forEach(datum => {
        data += datum.date + "," + datum.value + "\n";
      });

      var blob = new Blob([data], {type: 'text/csv'});
      var url= window.URL.createObjectURL(blob);
      window.open(url);
    } else {
      // Open popup
      this.openDialog();
    }
  }

  // When there is a second y-axis
  export2() {

    if (this.exportFormat == 'csv') {
      // Convert JSON to csv and download
      // TODO: HEADERS
      var data:string = "";
      
      var dates: Date[] = [];

      this.data.data.forEach(datum => {
        dates.push(datum.date);
      });

      this.data2.data.forEach(datum => {
        var found: boolean = false;
        dates.forEach(date => {
          if (datum.date == date) {
            found = true;
            return;
          }
        });
        if (!found)
          dates.push(datum.date);
      });

      dates.forEach(date => {
        data += date + ",";
        var found: boolean = false;
        this.data.data.forEach(datum => {
          if (date == datum.date) {
            found = true;
            data += datum.value + ",";
            return;
          }
        });

        var found2: boolean = true;
        this.data2.data.forEach(datum => {
          if (date == datum.date) {
            found2 = true;
            data += (found? "" : "---,") + datum.value + ",";
            return;
          }
        });

        data += (found? "" : "---,") + (found2? "" : "0") + "\n";
      });

      var blob = new Blob([data], {type: 'text/csv'});
      var url= window.URL.createObjectURL(blob);
      window.open(url);
    } else {
      // Open popup
      this.openDialog2();
    }
  }

  /**
   * Opens the Dialog instance with the data to export that
   * will be used in the ng-dygraph directive in 
   * export-selector.component.html.
   */
  openDialog(): void {
    // We need to convert the JSON data to csv
    var csv_data:string = "Date," + this.translateService.translate(this.data.variable) + "\n";
    
    // If the data is cathegorical it can't be represented graphically with
    // dygraphs, so, an error message is displayed instead.
    if(isNaN(parseFloat(this.data.data[0].value.toString()))){
      this.openSnackBar(this.translateService.translate("Use csv to export cathegorical data"), "");
      return;
    }
    
    this.data.data.forEach(datum => {
      csv_data += datum.date.toString() + "," + datum.value.toString() + "\n";
    });

    this.dialog.open(Dialog, {
      width: '70%',
      height: '70%',
      minHeight: "300px",
      data: {
        'node_id': this.dataFromHomeComponent[0], 
        'variable': this.dataFromHomeComponent[1],
        'sensor_data': csv_data,
        'options': {
          'width': 1000,
          'height': 250,
          'legend': 'always',
          'axes': {
            y: {
              valueFormatter: (v) => {
                return v + this.dataFromHomeComponent[2];  // controls formatting in the legend/mouseover
              },
              axisLabelFormatter: (v) => {
                return v + this.dataFromHomeComponent[2];  // controls formatting of the y-axis labels
              }
            }
          }
        }
      }
    });
  }

  // When there's a second variable
  openDialog2(): void {
    // We need to convert the JSON data to csv
    var data:string = "Date," + this.translateService.translate(this.data.variable) + "," + this.translateService.translate(this.data2.variable) + "\n";
    
    // If the data is cathegorical it can't be represented graphically with
    // dygraphs, so, an error message is displayed instead.
    if(isNaN(parseFloat(this.data.data[0].value.toString()))){
      this.openSnackBar(this.translateService.translate("Use csv to export cathegorical data"), "");
      return;
    }
    
    var data:string = "";
    
    var dates: Date[] = [];

    this.data.data.forEach(datum => {
      dates.push(datum.date);
    });

    this.data2.data.forEach(datum => {
      var found: boolean = false;
      dates.forEach(date => {
        if (datum.date == date) {
          found = true;
          return;
        }
      });
      if (!found)
        dates.push(datum.date);
    });

    dates.forEach(date => {
      data += date + ",";

      var found: boolean = false;
      this.data.data.forEach(datum => {
        if (date == datum.date) {
          found = true;
          data += datum.value + ",";
          return;
        }
      });

      var found2: boolean = false;
      
      this.data2.data.forEach(datum => {
        if (date == datum.date) {
          found2 = true;
          data += (found? "" : "0,") + datum.value;
          return;
        }
      });

      data += ((!found && !found2)? "0,0" : (!found2? "0" : "")) + "\n";
    });

    this.unit2 = "";
    var node2: string;
    
    this.nodes.forEach(node => {
      if (node._id == this.secondNodeId) {
        node2 = node.name;
        this.nodeTypes.forEach(nodeType => {
          if (nodeType._id == node.node_type_id) {
            nodeType.sensors.forEach(sensor => {
              if (sensor.variable == this.variable) {
                this.unit2 = sensor.unit;
                return;
              }
            });
          }
        });
        return;
      }
    });

    var node1: string;
    this.nodes.forEach(node => {
      if (node._id == this.dataFromHomeComponent[0]) {
        node1 = node.name;
      }
    });
    
    this.dialog.open(Dialog, {
      width: '70%',
      height: '70%',
      minHeight: "300px",
      data: {
        'node_id': this.dataFromHomeComponent[0], 
        'variable': this.dataFromHomeComponent[1],
        'sensor_data': data,
        'options': {
          'width': 1000,
          'height': 250,
          'legend': 'always',
          'axes': {
            x: {
                axisLabelFormatter: function (x) {
                    var aux = new Date(x);
                    return aux.toDateString();
                },
                valueFormatter: function (y) {
                    var aux = new Date(y); 
                    return aux.toISOString(); //Hide legend label
                }
            },
            y: {
              valueFormatter: (v) => {
                return v + this.dataFromHomeComponent[2];  // controls formatting in the legend/mouseover
              },
              axisLabelFormatter: (v) => {
                return v + this.dataFromHomeComponent[2];  // controls formatting of the y-axis labels
              }
            },
            y2: {
              valueFormatter: (v) => {
                return v + this.unit2;  // controls formatting in the legend/mouseover
              },
              axisLabelFormatter: (v) => {
                return v + this.unit2;  // controls formatting of the y-axis labels
              }
            }
          },
          labels: ["Date", node1, node2],
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
