import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getNodeData(nodeId:string, startDate:Date, endDate:Date, variable:string): Observable<Data> {
    return this.http.get<Data>(this.apiUrl + "/nodes/" + nodeId + "/data", {
      params: {
        'start_date': startDate.toDateString(),
        'end_date': endDate.toDateString(),
        'variable': variable
      }
    });
  }

  getNodeTypes(): Observable<NodeType[]> {
    return this.http.get<NodeType[]>(this.apiUrl + "/nodes/types")
  }

  getWaterBodies(): Observable<WaterBody[]> {
    return this.http.get<WaterBody[]>(this.apiUrl + "/water-bodies")
  }

  getValidDates(nodeId, variable): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + "/nodes/" + nodeId + "/available-dates", {
      params: {
        'variable': variable
      }
    });
  }

  constructor(private http: HttpClient) { }
}
