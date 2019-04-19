import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { Node } from 'src/app/models/node.model';
import { MessageService } from 'src/app/modules/utils/message/services/message/message.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-node',
  templateUrl: './edit-node.component.html',
  styleUrls: ['./edit-node.component.scss']
})
export class EditNodeFormComponent implements OnInit {
  node: Node;
  name: string;
  location: string;
  coordinates: number[];
  status: string;

  statusList: string[] = ['Off', 'Real Time', 'Non Real Time'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private messageService: MessageService,
    private loc: Location
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.apiService.getAllNodes().subscribe(page => {
        for (const node of page.items) {
          if (node.id === params['nodeId']) {
            this.node = node;
            this.coordinates = node.coordinates;
            this.location = node.location;
            this.status = node.status;
            this.name = node.name;
            break;
          }
        }
      });
    });
  }

  ngOnInit() {}

  saveNode() {
    const newNode = new Node();
    newNode.id = this.node.id;
    newNode.nodeTypeId = this.node.nodeTypeId;
    newNode.name = this.name;
    newNode.coordinates = this.coordinates;
    newNode.status = this.status;
    newNode.location = this.location;
    this.apiService.editNode(newNode).subscribe(
      () => {
        this.messageService.show('Cambios guardados.');
        this.loc.back();
      },
      () =>
        this.messageService.show(
          'Error guardando los cambios, intente nuevamente.'
        )
    );
  }

  updateCoords(newCoords: number[]) {
    this.coordinates = newCoords;
    console.log(this.coordinates);
  }
}
