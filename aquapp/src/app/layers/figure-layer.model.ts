import { FeatureGroup } from 'leaflet';
import { LayerBase } from './layer-base.model';

export interface FigureLayer extends LayerBase {
    figures: FeatureGroup;
}
