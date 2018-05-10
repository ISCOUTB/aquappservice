import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Node } from '../node';
import { Data } from '../sensor-data';
import { NodeType } from '../node-type';
import { Observable } from 'rxjs';
import { WaterBody } from '../water-body';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private apiUrl:string = "http://localhost:5000/api/v1";

  getNodes(): Observable<Node[]> {
    return this.http.get<Node[]>(this.apiUrl + "/nodes")
  }

  getNodeData(nodeId:string, startDate:Date, endDate:Date, variable:string): Observable<Data[]> {
    var parameters: HttpParams = new HttpParams();
    parameters.set('start_date', startDate.toString());
    parameters.set('end_date', endDate.toString());
    parameters.set('variable', variable)
    return this.http.get<Data[]>(this.apiUrl + "/" + nodeId + "/data", {
      params: parameters
    })
  }

  getNodeTypes(): Observable<NodeType[]> {
    return this.http.get<NodeType[]>(this.apiUrl + "/nodes/types")
  }

  getWaterBodies(): Observable<WaterBody[]> {
    return this.http.get<WaterBody[]>(this.apiUrl + "/water-bodies")
  }

  constructor(private http: HttpClient) { }
}
