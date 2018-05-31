import { Component, OnInit, ViewChild, ElementRef, Inject, Input } from '@angular/core';
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
  startDate: Date;
  endDate: Date;
  exportFormat: string;
  validDates: string[];
  @Input() dataFromNodeSelector: string[];
  data: Data;

  constructor(private apiService: ApiService, public dialog: MatDialog, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getValidDates();
  }

  getValidDates() {
    console.log(this.dataFromNodeSelector);
    this.apiService.getValidDates(this.dataFromNodeSelector[0], this.dataFromNodeSelector[1]).subscribe(validDates => this.validDates = validDates, 
      () => this.openSnackBar("Failed to fetch the data, check your internet connection", ""),
      () => this.resetDates());
  }

  getData() {
    if (this.startDate === undefined || 
        this.endDate === undefined || 
        this.exportFormat === undefined) {
      this.openSnackBar('Invalid input', '')
      return;
    }
    this.apiService.getNodeData(this.dataFromNodeSelector[0], this.startDate, this.endDate, this.dataFromNodeSelector[1]).subscribe(data => this.data = data, 
      () => this.openSnackBar("Failed to fetch the data, check your internet connection", ""),
      () => this.export());
  }

  export() {
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

  openDialog(): void {
    // We need to convert the JSON data to csv
    var csv_data:string = "Date," + this.data.variable + "\n";
    this.data.data.forEach(datum => {
      csv_data += datum.date.toString() + "," + datum.value.toString() + "\n";
    });

    this.dialog.open(Dialog, {
      width: '90%',
      height: '90%',
      data: {
        'node_id': this.dataFromNodeSelector[0], 
        'variable': this.dataFromNodeSelector[1],
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
    console.log(this.validDates);
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
