import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Data } from '../sensor-data';
import { Node } from '../node';
import { NodeType } from '../node-type';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-export-selector',
  templateUrl: './export-selector.component.html',
  styleUrls: ['./export-selector.component.css']
})

export class ExportSelectorComponent implements OnInit {
  nodes: Node[];
  nodeTypes: NodeType[];
  startDate: Date;
  endDate: Date;
  variable: string;
  data: Data;
  selectedNode: string;
  actualSelectedNode: Node;
  variables: string[];
  exportFormat: string;
  loadingData: boolean = false;
  validDates: string[];

  constructor(private apiService: ApiService, public dialog: MatDialog, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.apiService.getNodes().subscribe(nodes => this.nodes = nodes, 
      () => console.log("export-selector: Couldn't get the nodes"),
      () => this.getNodeTypes());
  }

  getNodeTypes() {
    this.apiService.getNodeTypes().subscribe(nodeTypes => this.nodeTypes = nodeTypes, 
      () => console.log("export-selector: Couldn't get the node types"));
  }

  getValidDates() {
    this.apiService.getValidDates(this.actualSelectedNode._id, this.variable).subscribe(validDates => this.validDates = validDates, 
      () => console.log("export-selector: Couldn't get the valid dates"),
      () => this.resetDates());
  }

  getData() {
    if (this.actualSelectedNode === undefined || this.startDate === undefined || 
        this.endDate === undefined || this.variable === undefined || 
        this.exportFormat === undefined) {
      this.openSnackBar('Invalid input', '')
      return;
    }
    this.apiService.getNodeData(this.actualSelectedNode._id, this.startDate, this.endDate, this.variable).subscribe(data => this.data = data, 
      () => console.log("export-selector: Couldn't get the nodes data"),
      () => this.export());
  }

  selectNode() {
    var nodeTypeId: string;
    this.variables = [];
    this.nodes.forEach(node => {
      if (node.name == this.selectedNode) {
        nodeTypeId = node.node_type_id;
        this.actualSelectedNode = node;
        return;
      }
    });

    this.nodeTypes.forEach(nodeType => {
      if (nodeType._id == nodeTypeId) {
        nodeType.sensors.forEach(sensor => {
          this.variables.push(sensor.variable);
        });
      }
    });
  }

  export() {
    if (this.exportFormat == 'csv') {
      // Convert JSON to csv and download
      this.loadingData = true;
      var data:string = "";
      this.data.data.forEach(datum => {
        data += datum.date + "," + datum.value + "\n";
      });
      this.loadingData = false;

      var blob = new Blob([data], {type: 'text/csv'});
      var url= window.URL.createObjectURL(blob);
      window.open(url);
    } else {
      // Open popup
      this.openDialog();
    }
  }

  openDialog(): void {
    // We need to convert the JSON data to csv
    var csv_data:string = "Date," + this.data.variable + "\n";
    console.log('export-selector: Converting data to csv');
    this.data.data.forEach(datum => {
      csv_data += datum.date.toString() + "," + datum.value.toString() + "\n";
    });
    console.log('export-selector: Data converted to csv, charting...');

    this.dialog.open(Dialog, {
      width: '90%',
      height: '90%',
      data: {
        'node_id': this.data.node_id, 
        'variable': this.data.variable,
        'sensor_data': csv_data,
        'options': {
          'width': 500,
          'height': 250
        }
      }
    });
  }
  
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

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  resetDates() {
    this.startDate = undefined;
    this.endDate = undefined;
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

  onNoClick(): void {
    this.dialogRef.close();
  }
}
