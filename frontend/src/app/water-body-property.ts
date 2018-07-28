export class Icam {
    date: Date;
    icampff_avg: number;
    icampffs: number[];
    nodes: string[];
}

export class WaterBodyProperty {
    type: string;
    name:string;
    icamfs: Icam[];
    icam: number;
}