import {inject} from '@loopback/context';
import {get, param} from '@loopback/openapi-v3';
import {
  NodeDataRepository,
  IcampffCacheRepository,
  WaterBodyRepository,
} from '../repositories';
import {repository} from '@loopback/repository';
import {AuthenticationBindings} from '@loopback/authentication';
import {Datum, IcampffCache, WaterBody} from '../models';

export class ExportDataController {
  constructor(
    @repository(NodeDataRepository)
    public nodeDataRepository: NodeDataRepository,
    @repository(IcampffCacheRepository)
    public icampffCacheRepository: IcampffCacheRepository,
    @repository(WaterBodyRepository)
    private waterBodyRepository: WaterBodyRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  @get('/export-data-csv')
  async exportData(
    @param.query.string('entity1Id') entity1Id: string,
    @param.query.string('entity1Type') entity1Type: string,
    @param.query.string('entity1Variable') entity1Variable: string,
    @param.query.string('entity1Start') entity1Start: string,
    @param.query.string('entity1End') entity1End: string,
    @param.query.string('entity2Id') entity2Id: string,
    @param.query.string('entity2Type') entity2Type: string,
    @param.query.string('entity2Variable') entity2Variable: string,
    @param.query.string('entity2Start') entity2Start: string,
    @param.query.string('entity2End') entity2End: string,
  ) {
    let result: string = '';
    let minDate: Date = new Date();
    let maxDate: Date = new Date();
    const st1 = entity1Start
      ? new Date(entity1Start).getTime()
      : new Date('1900-01-01').getTime();
    const ed1 = entity1End
      ? new Date(entity1End).getTime()
      : new Date().getTime();
    const st2 = entity2Start
      ? new Date(entity2Start).getTime()
      : new Date('1900-01-01').getTime();
    const ed2 = entity2End
      ? new Date(entity2End).getTime()
      : new Date().getTime();

    if (entity1Id && entity2Id) {
      if (entity1Type === 'node' && entity2Type === 'node') {
        result += `Date,${entity1Variable}(1),${entity2Variable}(2)\n`;
        const node1Data: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {and: [{nodeId: entity1Id}, {variable: entity1Variable}]},
            },
            {strictObjectIDCoercion: true},
          )
          .then(nd =>
            nd
              ? nd.data.filter(datum => {
                  if (datum.value === '-1') {
                    return false;
                  }
                  const time = new Date(datum.date).getTime();
                  minDate =
                    minDate.getTime() > time ? new Date(datum.date) : minDate;
                  maxDate =
                    maxDate.getTime() < time ? new Date(datum.date) : maxDate;
                  return time >= st1 && time <= ed1;
                })
              : [],
          );
        const node2Data: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {and: [{nodeId: entity2Id}, {variable: entity2Variable}]},
            },
            {strictObjectIDCoercion: true},
          )
          .then(nd =>
            nd
              ? nd.data.filter(datum => {
                  if (datum.value === '-1') {
                    return false;
                  }
                  const time = new Date(datum.date).getTime();
                  minDate =
                    minDate.getTime() > time ? new Date(datum.date) : minDate;
                  maxDate =
                    maxDate.getTime() < time ? new Date(datum.date) : maxDate;
                  return time >= st2 && time <= ed2;
                })
              : [],
          );
        for (const node1Datum of node1Data) {
          result += `${node1Datum.date},${node1Datum.value},`;
          let match = false;
          let index = 0;
          for (const node2Datum of node2Data) {
            if (node2Datum.date.toString() === node1Datum.date.toString()) {
              result += `${node2Datum.value}\n`;
              match = true;
              break;
            }
            index++;
          }
          if (!match) {
            result += '\n';
          } else {
            // This datum is already in the result
            node2Data.splice(index, 1);
          }
        }
        for (const node2Datum of node2Data) {
          result += `${node2Datum.date},,${node2Datum.value}\n`;
        }
      } else if (entity1Type === 'node' && entity2Type === 'waterBody') {
        result += `Date,${entity1Variable},ICAMpff\n`;
        const nodeData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {and: [{nodeId: entity1Id}, {variable: entity1Variable}]},
            },
            {strictObjectIDCoercion: true},
          )
          .then(nd =>
            nd
              ? nd.data.filter(datum => {
                  if (datum.value === '-1') {
                    return false;
                  }
                  const time = new Date(datum.date).getTime();
                  minDate =
                    minDate.getTime() > time ? new Date(datum.date) : minDate;
                  maxDate =
                    maxDate.getTime() < time ? new Date(datum.date) : maxDate;
                  return time >= st1 && time <= ed1;
                })
              : [],
          );
        const waterBodyData: {
          date: Date;
          value: number;
        }[] = await this.getIcampffAvgCaches(entity2Id).then(wbd =>
          wbd.filter(w => {
            const time = new Date(w.date).getTime();
            return time >= st2 && time <= ed2;
          }),
        );

        for (const node1Datum of nodeData) {
          result += `${node1Datum.date},${node1Datum.value},`;
          let match = false;
          let index = 0;
          for (const icampff of waterBodyData) {
            if (icampff.date.toString() === node1Datum.date.toString()) {
              result += `${icampff.value}\n`;
              match = true;
              break;
            }
            index++;
          }
          if (!match) {
            result += '\n';
          } else {
            // This datum is already in the result, trashing it may speed up the query
            waterBodyData.splice(index, 1);
          }
        }
        for (const icampff of waterBodyData) {
          result += `${icampff.date},,${icampff.value}\n`;
        }
      } else if (entity1Type === 'waterBody' && entity2Type === 'node') {
        result += `Date,ICAMpff,${entity2Variable}\n`;
        const waterBodyData: {
          date: Date;
          value: number;
        }[] = await this.getIcampffAvgCaches(entity1Id).then(wbd =>
          wbd.filter(w => {
            const time = new Date(w.date).getTime();
            minDate = minDate.getTime() > time ? new Date(w.date) : minDate;
            maxDate = maxDate.getTime() < time ? new Date(w.date) : maxDate;
            return time >= st1 && time <= ed1;
          }),
        );

        const nodeData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {and: [{nodeId: entity2Id}, {variable: entity2Variable}]},
            },
            {strictObjectIDCoercion: true},
          )
          .then(nd =>
            nd
              ? nd.data.filter(datum => {
                  if (datum.value === '-1') {
                    return false;
                  }
                  const time = new Date(datum.date).getTime();
                  minDate =
                    minDate.getTime() > time ? new Date(datum.date) : minDate;
                  maxDate =
                    maxDate.getTime() < time ? new Date(datum.date) : maxDate;
                  return time >= st1 && time <= ed1;
                })
              : [],
          );

        for (const icampff of waterBodyData) {
          result += `${icampff.date},${icampff.value},`;
          let match = false;
          let index = 0;
          for (const nodeDatum of nodeData) {
            if (icampff.date.toString() === nodeDatum.date.toString()) {
              result += `${nodeDatum.value}\n`;
              match = true;
              break;
            }
            index++;
          }
          if (!match) {
            result += '\n';
          } else {
            // This datum is already in the result, trashing it may speed up the query
            nodeData.splice(index, 1);
          }
        }
        for (const icampff of waterBodyData) {
          result += `${icampff.date},,${icampff.value}\n`;
        }
      } else {
        // Water body and water body
        result += `Date,ICAMPff(1),ICAMPff(2)\n`;
        const waterBody1Data: {
          date: Date;
          value: number;
        }[] = await this.getIcampffAvgCaches(entity1Id).then(wbd =>
          wbd.filter(w => {
            const time = new Date(w.date).getTime();
            minDate = minDate.getTime() > time ? new Date(w.date) : minDate;
            maxDate = maxDate.getTime() < time ? new Date(w.date) : maxDate;
            return time >= st1 && time <= ed1;
          }),
        );
        const waterBody2Data: {
          date: Date;
          value: number;
        }[] = await this.getIcampffAvgCaches(entity2Id).then(wbd =>
          wbd.filter(w => {
            const time = new Date(w.date).getTime();
            return time >= st2 && time <= ed2;
          }),
        );
        for (const icampff of waterBody1Data) {
          result += `${icampff.date},${icampff.value},`;
          let match = false;
          let index = 0;
          for (const icampff2 of waterBody2Data) {
            if (icampff.date.toString() === icampff2.date.toString()) {
              result += `${icampff2.value}\n`;
              match = true;
              break;
            }
            index++;
          }
          if (!match) {
            result += '\n';
          } else {
            // This datum is already in the result, trashing it may speed up the query
            waterBody2Data.splice(index, 1);
          }
        }
        for (const icampff of waterBody2Data) {
          result += `${icampff.date},,${icampff.value}\n`;
        }
      }
    } else if (entity1Id) {
      if (entity1Type === 'node') {
        result += `Date,${entity1Variable}\n`;
        const nodeData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {and: [{nodeId: entity1Id}, {variable: entity1Variable}]},
            },
            {strictObjectIDCoercion: true},
          )
          .then(nd =>
            nd
              ? nd.data.filter(datum => {
                  if (datum.value === '-1') {
                    return false;
                  }
                  const time = new Date(datum.date).getTime();
                  minDate =
                    minDate.getTime() > time ? new Date(datum.date) : minDate;
                  maxDate =
                    maxDate.getTime() < time ? new Date(datum.date) : maxDate;
                  return time >= st1 && time <= ed1;
                })
              : [],
          );
        for (const node1Datum of nodeData) {
          result += `${node1Datum.date},${node1Datum.value}\n`;
        }
      } else {
        // Water body
        result += `Date,ICAMPff\n`;
        const waterBodyData: {
          date: Date;
          value: number;
        }[] = await this.getIcampffAvgCaches(entity1Id).then(wbd =>
          wbd.filter(w => {
            const time = new Date(w.date).getTime();
            minDate = minDate.getTime() > time ? new Date(w.date) : minDate;
            maxDate = maxDate.getTime() < time ? new Date(w.date) : maxDate;
            return time >= st1 && time <= ed1;
          }),
        );
        for (const icampff of waterBodyData) {
          result += `${icampff.date},${icampff.value}\n`;
        }
      }
    }

    return {data: result, minDate: minDate, maxDate: maxDate};
  }

  async getIcampffAvgCaches(waterBodyId: string) {
    let icampffCaches: IcampffCache[][] = [];
    let avgs: {date: Date; value: number}[] = [];
    let waterBody: WaterBody = await this.waterBodyRepository
      .findById(waterBodyId)
      .then(wb => wb);

    if (waterBody.nodes) {
      for (const node of waterBody.nodes) {
        await this.icampffCacheRepository
          .find(
            {where: {and: [{nodeId: node}, {waterBodyId: waterBody.id}]}},
            {strictObjectIDCoercion: true},
          )
          .then(
            caches => {
              icampffCaches.push(caches);
            },
            () => {
              icampffCaches.push([]);
            },
          );
      }
    }

    if (icampffCaches.length) {
      for (let index = 0; index < icampffCaches[0].length; index++) {
        let value = 0;
        for (const cache of icampffCaches) {
          value += cache[index].value;
        }
        value /= icampffCaches.length;
        avgs.push({date: icampffCaches[0][index].date, value: value});
      }
    }

    return avgs;
  }
}
