import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Data } from '../sensor-data';
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

  exportFormat: string;  // 'csv' or 'chart'

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
    this.getValidDates();
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
  getValidDates() {
    this.apiService.getValidDates(this.dataFromHomeComponent[0], this.dataFromHomeComponent[1]).subscribe(validDates => this.validDates = validDates, 
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

  /**
   * Exports the data in csv or as a chart using dygraphs
   * (more info at http://dygraphs.com/)
   */
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
          'height': 250
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
