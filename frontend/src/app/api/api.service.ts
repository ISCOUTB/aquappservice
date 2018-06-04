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
  // IT'S http://aquapp.utb.services:8080/api/v1 FOR PRODUCTION!
  private apiUrl:string = "http://aquapp.utb.services:8080/api/v1";

  getNodes(): Observable<Node[]> {
    return this.http.get<Node[]>(this.apiUrl + "/nodes");
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
    return this.http.get<NodeType[]>(this.apiUrl + "/nodes/types");
  }

  getWaterBodies(): Observable<WaterBody[]> {
    return this.http.get<WaterBody[]>(this.apiUrl + "/water-bodies");
  }

  getValidDates(nodeId, variable): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + "/nodes/" + nodeId + "/available-dates", {
      params: {
        'variable': variable
      }
    });
  }

  getICAMPff(waterBodyId): Observable<number> {
    return this.http.get<number>(this.apiUrl + "/water-bodies/" + waterBodyId + "/icampff");
  }

  login(username, password): Observable<string> {
    return this.http.get<string>(this.apiUrl + "/login", {
      headers: {
        'username': username,
        'password': password
      }
    });
  }

  constructor(private http: HttpClient) { }
}
