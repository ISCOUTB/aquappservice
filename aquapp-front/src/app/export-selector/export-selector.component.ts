import 'dygraphs';
import { Component, OnInit } from '@angular/core';
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
  graph: Dygraph;
  nodeId: string;
  startDate: Date;
  endDate: Date;
  variable: string;
  data: Data[];
  selectedNode: string;
  actualSelectedNode: Node;
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getNodes().subscribe(nodes => this.nodes = nodes, 
      () => console.log("export-selector: Couldn't get the nodes"),
      () => this.getNodeTypes());
  }

  getNodeTypes() {
    this.apiService.getNodeTypes().subscribe(nodeTypes => this.nodeTypes = nodeTypes, 
      () => console.log("export-selector: Couldn't get the node types"));
  }

  getData() {
    this.apiService.getNodeData(this.nodeId, this.startDate, this.endDate, this.variable).subscribe(data => this.data = data, 
      () => console.log("export-selector: Couldn't get the nodes data"));
  }

  selectNode() {
    console.log("Selecting node")
  }

}
