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
  /**
   *
   * @param nodeDataRepository Node data repository
   * @param icampffCacheRepository ICAMpff caches repository
   * @param waterBodyRepository Water bodies repository
   * @param user Information about the currently authenticated
   *  user (if any). This information is provided by the callback function
   *  in the method verifyBearer of the class AuthStrategyProvider in
   *  auth-strategy.provider.ts (the payload of the token).
   *  The second parameter makes it possible to have unprotected methods
   *  like getElemets.
   */
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

  /**
   * This returns a csv file (as a string) and the min and max dates
   * that appear in the data. This csv file is going to be used
   * in the frontend by Dygraphs.
   * @param entity1Id Id of a node or water body
   * @param entity1Type 'node' or 'waterBody'
   * @param entity1Variable Sensor (if entity1Type === 'node')
   * @param entity1Start Remove data that has a date < than this
   * @param entity1End  Remove data that has a date > than this
   * @param entity2Id Id of a node or water body, that's going to be
   * compared to the data of the node or water body with id
   * entity1Id.
   * @param entity2Type 'node' or 'waterBody'
   * @param entity2Variable Sensor (if entity2Type === 'node')
   * @param entity2Start  Remove data that has a date < than this
   * @param entity2End  Remove data that has a date > than this
   */
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
    let maxDate: Date = new Date('1900-01-01');
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
          const node1Date = new Date(node1Datum.date).toISOString();
          result += `${node1Date},${node1Datum.value},`;
          let match = false;
          let index = 0;
          for (const node2Datum of node2Data) {
            if (new Date(node2Datum.date).toISOString() === node1Date) {
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
          const node1Date = new Date(node1Datum.date).toISOString();
          result += `${node1Date},${node1Datum.value},`;
          let match = false;
          let index = 0;
          for (const icampff of waterBodyData) {
            if (new Date(icampff.date).toISOString() === node1Date) {
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
          const icDate = new Date(icampff.date).toISOString();
          result += `${icDate},${icampff.value},`;
          let match = false;
          let index = 0;
          for (const nodeDatum of nodeData) {
            if (icDate === new Date(nodeDatum.date).toISOString()) {
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
          const icDate = new Date(icampff.date).toISOString();
          result += `${icDate},${icampff.value},`;
          let match = false;
          let index = 0;
          for (const icampff2 of waterBody2Data) {
            if (icDate === new Date(icampff2.date).toISOString()) {
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
          result += `${new Date(node1Datum.date).toISOString()},${
            node1Datum.value
          }\n`;
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
          result += `${new Date(icampff.date).toISOString()},${
            icampff.value
          }\n`;
        }
      }
    }

    return {data: result, minDate: minDate, maxDate: maxDate};
  }

  /**
   * Returns an array with the averages of the ICAMpff values with its
   * date for every node that belongs to the water body
   * @param waterBodyId Id of the water body
   */
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

  /**
   * Get the dates when there are data for a given sensor
   * of a node or water body
   * @param entityId Id of a node or water body
   * @param entityType 'node' or 'waterBody'
   * @param variable Sensor
   */
  @get('/valid-dates')
  async validDates(
    @param.query.string('entityId') entityId: string,
    @param.query.string('entityType') entityType: string,
    @param.query.string('variable') variable: string,
  ) {
    if (entityType === 'node') {
      return await this.nodeDataRepository
        .findOne(
          {
            where: {and: [{nodeId: entityId}, {variable: variable}]},
          },
          {strictObjectIDCoercion: true},
        )
        .then(
          nodeData => {
            if (!nodeData) {
              return Promise.reject({status: 404});
            }
            return Promise.resolve(
              nodeData.data
                .filter(datum => datum.value !== '-1')
                .map(datum => new Date(datum.date).toISOString()),
            );
          },
          () => Promise.reject({status: 500}),
        );
    } else {
      return this.getIcampffAvgCaches(entityId).then(avgCaches =>
        avgCaches.map(avgCache => avgCache.date.toISOString()),
      );
    }
  }
}
