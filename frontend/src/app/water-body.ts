import { WaterBodyProperty } from './water-body-property';
import { WaterBodyGeometry } from './water-body-geometry';

export class WaterBody {
    _id: string;
    id: string;
    type: string;
    properties: WaterBodyProperty;
    geometry: WaterBodyGeometry;
    selectedDate: string;
}