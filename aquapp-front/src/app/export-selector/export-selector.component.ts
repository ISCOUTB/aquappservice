import 'dygraphs';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  data: Data;
  selectedNode: string;
  actualSelectedNode: Node;
  variables: string[];
  exportFormat: string;
  loadingData: boolean = false;

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
    this.apiService.getNodeData(this.actualSelectedNode._id, this.startDate, this.endDate, this.variable).subscribe(data => this.data = data, 
      () => console.log("export-selector: Couldn't get the nodes data"),
      () => this.export());
  }

  selectNode() {
    console.log("Selecting node");
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
    }
  }
}
