import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service'
import { Node } from '../node'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  nodes: Node[];
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getNodes();
  }

  getNodes(): void {
    this.apiService.getNodes().subscribe(nodes => this.nodes = nodes)
  }

}
