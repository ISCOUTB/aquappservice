import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { WaterBody } from 'src/app/modules/aquapp/models/water-body.model';
import { Node } from 'src/app/models/node.model';
import { Sensor } from 'src/app/models/sensor.model';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { MessageService } from 'src/app/services/message/message.service';
import { TranslateService } from 'src/app/services/translate/translate.service';

@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss'],
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
export class ExportDataFormComponent implements OnInit {
  loading = true;
  failed = false;
  entity1Id: string;
  entity1Name: string;
  entity1Type: string;
  entity1Variable: string;
  entity1Start: Date;
  entity1End: Date;

  entity2Id: string;
  entity2Name: string;
  entity2Type: string;
  entity2Variable: string;
  entity2Start: Date;
  entity2End: Date;

  entity1Sensors: Sensor[];
  entity2Sensors: Sensor[];

  nodes: Node[];
  waterBodies: WaterBody[];

  validDates: Date[];

  filterDates = (d: Date, validDates = this.validDates) => {
    return validDates.some(validDate => {
      return (
        validDate.getFullYear() === d.getFullYear() &&
        validDate.getMonth() === d.getMonth() &&
        validDate.getDate() === d.getDate()
      );
    });
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.entity1Id = params['entity1Id'];
      this.entity1Type = params['entity1Type'];
      this.entity1Variable = params['variable'];
      this.getData();
    });
  }

  ngOnInit() {}

  async getData() {
    await this.apiService
      .getAllNodes()
      .toPromise()
      .then(
        page => {
          this.nodes = page.items;
        },
        () => {
          this.loading = false;
          this.failed = true;
        }
      );

    await this.apiService
      .getAllWaterBodies()
      .toPromise()
      .then(
        wb => {
          this.waterBodies = wb;
        },
        () => {
          this.failed = true;
          this.loading = false;
        }
      );

    if (this.entity1Type === 'node') {
      const index = this.nodes.findIndex(n => n.id === this.entity1Id);
      this.entity1Name = this.nodes[index].name;

      await this.apiService
        .getAllSensors(this.nodes[index].nodeTypeId)
        .toPromise()
        .then(
          s => (this.entity1Sensors = s),
          () => {
            this.failed = true;
            this.loading = false;
          }
        );
    } else {
      const index = this.waterBodies.findIndex(n => n.id === this.entity1Id);
      this.entity1Name = this.waterBodies[index].name;
      await this.apiService
        .getValidDates(this.entity1Id, 'waterBody')
        .toPromise()
        .then(
          (validDates: string[]) =>
            (this.validDates = validDates.map(validDate => new Date(validDate)))
        );
    }
    this.loading = false;
  }

  async getValidDates() {
    this.loading = true;
    await this.apiService
      .getValidDates(this.entity1Id, 'node', this.entity1Variable)
      .toPromise()
      .then(
        (validDates: string[]) =>
          (this.validDates = validDates.map(validDate => new Date(validDate))),
        () => (this.failed = true)
      );
    this.loading = false;
  }

  async getEntity2Sensors(nodeTypeId: string, name: string) {
    this.entity2Name = name;
    this.loading = true;
    await this.apiService
      .getAllSensors(nodeTypeId)
      .toPromise()
      .then(s => (this.entity2Sensors = s));
    this.loading = false;
  }

  export() {
    if (this.entity1Type === 'node' && this.entity1Variable === undefined) {
      this.messageService.show(
        this.translateService.translate('Select the variable')
      );
      return;
    }
    if (this.entity2Type === 'node' && this.entity2Variable === undefined) {
      this.messageService.show(
        this.translateService.translate(
          'Select the variable of the second node'
        )
      );
      return;
    }
    this.router.navigate(['resultado-exportar-datos'], {
      queryParams: {
        entity1Id: this.entity1Id,
        entity1Type: this.entity1Type,
        entity1Variable: this.entity1Variable || '',
        entity1Start: this.entity1Start ? this.entity1Start.toISOString() : '',
        entity1End: this.entity1End ? this.entity1End.toISOString() : '',
        entity2Id: this.entity2Id || '',
        entity2Type: this.entity2Type || '',
        entity2Variable: this.entity2Variable || '',
        entity2Start: this.entity1Start ? this.entity1Start.toISOString() : '',
        entity2End: this.entity1End ? this.entity1End.toISOString() : '',
        entity1Name: this.entity1Name,
        entity2Name: this.entity2Name
      }
    });
  }
}
