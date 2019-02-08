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
  options = {
    pointSize: 1.5,
    highlightCircleSize: 2.5,
    drawPoints: true,
    strokeWidth: 0.0,
    displayAnnotations: true,
    width: '100%',
    height: 250,
    legend: 'always'
  };
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.apiService
        .exportData(
          params['entity1Id'],
          params['entity1Type'],
          params['entity1Variable'],
          params['entity1Start'],
          params['entity1End'],
          params['entity2Id'],
          params['entity2Type'],
          params['entity2Start'],
          params['entity2End']
        )
        .subscribe(
          result => {
            this.data = result.data;
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
