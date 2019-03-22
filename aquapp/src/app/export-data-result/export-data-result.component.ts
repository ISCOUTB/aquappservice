import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { ApiService } from '../api/api.service';
import { ActivatedRoute } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { CordovaService } from '../cordova/cordova.service';

@Component({
  selector: 'app-export-data-result',
  templateUrl: './export-data-result.component.html',
  styleUrls: ['./export-data-result.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
          height: '0px',
          display: 'none'
        })
      ),
      transition('void <=> *', animate(225))
    ])
  ]
})
export class ExportDataResultComponent implements OnInit {
  loading = true;
  failed = false;
  data: string;
  options: any = {
    pointSize: 1.5,
    highlightCircleSize: 2.5,
    drawPoints: true,
    strokeWidth: 0.0,
    displayAnnotations: true,
    width: '100%',
    height: 250,
    legend: 'always'
  };
  entityCount = 1;
  entity1Name: string;
  entity2Name: string;
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public cordovaService: CordovaService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.entityCount = params['entity1Id'] && params['entity2Id'] ? 2 : 1;
      this.entity1Name = params['entity1Name'];
      this.entity2Name = params['entity2Name'] || '';
      this.apiService
        .exportData(
          params['entity1Id'],
          params['entity1Type'],
          params['entity1Variable'],
          params['entity1Start'],
          params['entity1End'],
          params['entity2Id'],
          params['entity2Type'],
          params['entity2Variable'],
          params['entity2Start'],
          params['entity2End']
        )
        .subscribe(
          result => {
            this.data = result.data;
            this.options.dateWindow = [
              new Date(result.minDate).getTime() - 3600 * 24 * 30 * 1000,
              new Date(result.maxDate).getTime() + 3600 * 24 * 30 * 1000
            ];
            this.loading = false;
          },
          () => {
            this.loading = false;
            this.failed = true;
          }
        );
    });
  }

  ngOnInit() {}

  save() {
    const blob = new Blob([this.data], {
      type: 'text/csv'
    });
    saveAs(blob, 'resultados.csv');
  }
}
