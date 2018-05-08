import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-export-selector',
  templateUrl: './export-selector.component.html',
  styleUrls: ['./export-selector.component.css']
})

export class ExportSelectorComponent implements OnInit {
  nodes: String[];
  constructor() { }

  ngOnInit() {
  }

}
