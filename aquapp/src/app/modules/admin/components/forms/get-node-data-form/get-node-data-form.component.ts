import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/modules/utils/message/services/message/message.service';
import { ApiService } from 'src/app/services/api/api.service';
import {
  animate,
  style,
  transition,
  trigger
} from '@angular/animations';

@Component({
  selector: 'app-get-node-data-form',
  templateUrl: './get-node-data-form.component.html',
  styleUrls: ['./get-node-data-form.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0', height: 0 }),
        animate('0.5s ease-out', style({ opacity: '1', height: '*' }))
      ])
    ])
  ]
})
export class GetNodeDataFormComponent implements OnInit {
  variables: string[];
  variable: string;
  start: Date;
  end: Date;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.apiService
        .getAllSensors(params['nodeTypeId'])
        .subscribe(
          sensors => (this.variables = sensors.map(s => s.variable)),
          () =>
            this.messageService.show(
              'Error obteniendo las variables, intente de nuevo'
            )
        );
    });
  }

  ngOnInit() {}

  getData() {
    this.router.navigate(['datos-de-los-nodos'], {
      queryParams: {
        variable: this.variable,
        start: this.start ? this.start.toISOString() : '',
        end: this.end ? this.end.toISOString() : ''
      },
      queryParamsHandling: 'merge'
    });
  }
}
