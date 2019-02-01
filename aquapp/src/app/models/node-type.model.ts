import { Sensor } from './sensor.model';

export class NodeType {
  id: string;
  name: string;
  separator: string;
  sensors: Sensor[];
}
