import { LayerBase } from './layer-base.model';
import { Marker } from 'leaflet';

export interface MarkerLayer extends LayerBase {
  markers: Marker[];
}
