import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Node } from '../node';
import { Data } from '../sensor-data';
import { NodeType } from '../node-type';
import { Observable } from 'rxjs';
import { WaterBody } from '../water-body';
// import { Message } from '@angular/compiler/src/i18n/i18n_ast';


class User {
  username: string;
  password: string;
  constructor(u, p) {
    this.username = u;
    this.password = p;
  }
}

class EditNode {
  name: string; 
  location: string; 
  coordinates: number[]; 
  status: string; 
  node_type_id: string
  constructor(name: string, location: string, coordinates: number[], status: string, node_type_id: string) {
    this.name = name;
    this.location = location;
    this.coordinates = coordinates;
    this.status = status;
    this.node_type_id = node_type_id;
  }
}

class Icam {
  date: Date;
  icampff_avg: number;
  icampffs: number[];
  nodes: string[];
}

class Response {
  message: string;
  TOKEN: string;
}

class Datum {
  value: string | number;
  date: string;
  variable: string;
  constructor(value: string | number, date: string, variable: string) {
    this.value = value;
    this.date = date;
    this.variable = variable;
  }
}

export class CSVData {
  csv: string;
  minDate: Date;
  maxDate: Date;
  constructor(c: string, min: string, max: string) {
    this.csv = c;
    this.minDate = new Date(Date.parse(min));
    this.minDate.setMonth(this.minDate.getMonth() - 1);
    this.maxDate = new Date(Date.parse(max));
    this.maxDate.setMonth(this.maxDate.getMonth() + 1);
  }
}

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private apiUrl:string = "http://aquapp.utb.edu.co:8080/api/v1";

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

  getValidDates2(waterBodyId): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + "/water-bodies/" + waterBodyId + "/available-dates");
  }

  getICAMPff(waterBodyId): Observable<Icam[]> {
    return this.http.get<Icam[]>(this.apiUrl + "/water-bodies/" + waterBodyId + "/icampff");
  }

  login(username: string, password: string): Observable<Response> {
    // "{'username': " + username.toString() + ", 'password':" + password.toString() + "}"
    return this.http.post<Response>(
      this.apiUrl + "/login/", new User(username, password), 
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
  }

  editNode(token: string, _id: string, name: string, location: string, coordinates: number[], status: string, node_type_id: string): Observable<Response> {
    return this.http.put<Response>(
      this.apiUrl + "/nodes/" + _id + "/edit", 
      new EditNode(name, location, coordinates, status, node_type_id),
      {
        headers: {
          'Content-Type': 'text/plain',
          'TOKEN': token
        }
      }
    );
  }

  createNode(token: string, name: string, location: string, coordinates: number[], status: string, node_type_id: string) {
    return this.http.post<Response>(
      this.apiUrl + "/nodes/add",
      [new EditNode(name, location, coordinates, status, node_type_id)],
      {
        headers: {
          'Content-Type': 'text/plain',
          'TOKEN': token
        }
      }
    );
  }

  deleteNode(token: string, _id) {
    return this.http.delete<Response>(
      this.apiUrl + "/nodes/" + _id + "/delete",
      {
        headers: {
          'TOKEN': token
        }
      }
    );
  }

  getCSVData1(id: string, variable:string, startDate: string, endDate: string): Observable<CSVData> {
    return this.http.get<CSVData>(
      this.apiUrl + "/nodes/" + id + "/export-as-csv",
      {
        params: {
          'start_date_1': startDate,
          'end_date_1': endDate,
          'variable_1': variable
        }
      }
    );
  }

  getCSVData2(id1: string, variable1:string, startDate1: string, endDate1: string,
              id2: string, variable2: string, startDate2: string, endDate2: string): Observable<CSVData> {
    return this.http.get<CSVData>(
      this.apiUrl + "/nodes/" + id1 + "/export-as-csv",
      {
        params: {
          'start_date_1': startDate1,
          'end_date_1': endDate1,
          'variable_1': variable1,
          'start_date_2': startDate2,
          'end_date_2': endDate2,
          'variable_2': variable2,
          'id_2': id2
        }
      }
    );
  }

  getCSVData3(id1: string, startDate1: string, endDate1: string): Observable<CSVData> {
    return this.http.get<CSVData>(
      this.apiUrl + "/water-bodies/" + id1 + "/export-as-csv",
      {
        params: {
          'start_date_1': startDate1,
          'end_date_1': endDate1,
        }
      }
    );
  }

  getCSVData4(id1: string, startDate1: string, endDate1: string,
    id2: string, variable2: string, startDate2: string, endDate2: string): Observable<CSVData> {
    return this.http.get<CSVData>(
      this.apiUrl + "/water-bodies/" + id1 + "/export-as-csv",
      {
        params: {
          'start_date_1': startDate1,
          'end_date_1': endDate1,
          'start_date_2': startDate2,
          'end_date_2': endDate2,
          'variable_2': variable2,
          'id_2': id2
        }
      }
    );
  }

  addData(token: string, variable: string, date: string, value: number | string, _id: string) {
    return this.http.post<Response>(
      this.apiUrl + "/nodes/" + _id + "/add-sensor-data",
      [new Datum(value, new Date(Date.parse(date)).toISOString(), variable)],
      {
        headers: {
          'Content-Type': 'text/plain',
          'TOKEN': token,
        }
      }
    );
  }

  constructor(private http: HttpClient) { }
}
