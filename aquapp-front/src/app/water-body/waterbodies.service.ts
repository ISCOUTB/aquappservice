import { Injectable, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service'
import { Node } from '../node';
import { WaterBody } from '../water-body'
import { of, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})

export class WaterbodiesService {
  nodes: Node[];
  waterBodies: WaterBody[];
  icamSet: boolean = false;
  
  constructor(private apiService: ApiService) { }

  /**
   * getNodes(): void {
    this.apiService.getNodes().subscribe(nodes => this.nodes = nodes, 
      () => console.log("waterbodies-service: Couldn't get the nodes"), 
      () => this.getWaterBodiesFromAPI());
  }

  getWaterBodiesFromAPI(): void {
    this.apiService.getWaterBodies().subscribe(waterBodies => this.waterBodies = waterBodies, 
      () => console.log("waterbodies-service: Couldn't get the water bodies"),
      () => this.getICAMpff());
  }
   */

  getICAMpff(): void {
    
  }

  getWaterBodies(): Observable<WaterBody[]> {
    if (!this.icamSet) {
      this.apiService.getWaterBodies().subscribe(waterBodies => this.waterBodies = waterBodies, 
        () => console.log("waterbodies-service: Couldn't get the water bodies"),
        () => this.getICAMpff());
    }
    return of(this.waterBodies);
  }

}
