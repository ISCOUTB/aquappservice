import {inject} from '@loopback/context';
import {get, param, put, post, del, requestBody} from '@loopback/openapi-v3';
import {
  NodeDataRepository,
  WaterBodyRepository,
  IcampffCacheRepository,
} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {IcampffCache, WaterBody, Datum, NodeData} from '../models';
import * as fetch from 'node-fetch';

export class IcampffController {
  /**
   *
   * @param nodeDataRepository Node data repository
   * @param waterBodyRepository Water body repository
   * @param icampffCacheRepository ICAMpff cache repository
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
    @repository(WaterBodyRepository)
    private waterBodyRepository: WaterBodyRepository,
    @repository(IcampffCacheRepository)
    private icampffCacheRepository: IcampffCacheRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: string},
  ) {}

  /**
   * Returns an array of ICAMpff caches arrays, for every node that belongs to
   * the water body specified by waterBodyId
   * @param waterBodyId Id of the water body that the ICAMpff caches belongs to
   * @param pageIndex Page number, 0 to N
   * @param pageSize Number of elements
   */
  @get('/icampff-caches')
  async getElements(
    @param.query.string('waterBodyId') waterBodyId: string,
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let icampffCaches: IcampffCache[][] = [];

    await this.waterBodyRepository.findById(waterBodyId).then(
      async waterBody => {
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
      },
      () => [],
    );

    if (pageIndex === undefined && pageSize === undefined) {
      return icampffCaches;
    }

    return {
      items: icampffCaches.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > icampffCaches.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: icampffCaches.length,
    };
  }

  /**
   * Returns an array with the averages of the ICAMpff values with its
   * date for every node that belongs to the water body
   * @param waterBodyId Id of the water body the ICAMpff averages belong to
   * @param pageIndex Page number, 0 to N
   * @param pageSize Number of elements
   */
  @get('/icampff-avg-caches')
  async getAvgCaches(
    @param.query.string('waterBodyId') waterBodyId: string,
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
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
      for (
        let index = 0;
        index < Math.min(...icampffCaches.map(cache => cache.length));
        index++
      ) {
        let value = 0;
        for (const cache of icampffCaches) {
          value += cache[index].value;
        }
        value /= icampffCaches.length;
        avgs.push({date: icampffCaches[0][index].date, value: value});
      }
    }

    if (pageIndex === undefined && pageSize === undefined) {
      return avgs;
    }

    return {
      items: avgs.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > avgs.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: avgs.length,
    };
  }

  /**
   * Generates the caches for every node in every water body
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
  @put('/icampff-caches')
  async buildCaches() {
    const waterBodies: WaterBody[] = await this.waterBodyRepository
      .find()
      .then(wb => wb, () => []);
    if (!waterBodies.length) {
      return Promise.reject({});
    }
    for (const waterBody of waterBodies) {
      // Create icampff cache for each node of each water body
      if (!waterBody.nodes) {
        continue;
      }
      for (const node of waterBody.nodes) {
        // Create icampff cache for each node
        // Sensor data
        let dissolvedOxygenData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {
                and: [{nodeId: node}, {variable: 'Dissolved Oxygen (DO)'}],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        let nitrateData: Datum[] = await this.nodeDataRepository
          .findOne(
            {where: {and: [{nodeId: node}, {variable: 'Nitrate (NO3)'}]}},
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        let totalSuspendedSolidsData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {
                and: [
                  {nodeId: node},
                  {variable: 'Total Suspended Solids (TSS)'},
                ],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        let thermotolerantColiformsData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {
                and: [{nodeId: node}, {variable: 'Thermotolerant Coliforms'}],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        let pHData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {
                and: [{nodeId: node}, {variable: 'pH'}],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        let chlorophyllAData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {
                and: [{nodeId: node}, {variable: 'Chrolophyll A (CLA)'}],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        let biochemicalOxygendDemandData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {
                and: [
                  {nodeId: node},
                  {variable: 'Biochemical Oxygen Demand (BOD)'},
                ],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        let phosphatesData: Datum[] = await this.nodeDataRepository
          .findOne(
            {
              where: {
                and: [{nodeId: node}, {variable: 'Phosphates (PO4)'}],
              },
            },
            {strictObjectIDCoercion: true},
          )
          .then(d => (d ? d.data : []));
        for (let index = 0; index < phosphatesData.length; index++) {
          let newIcampffCache = new IcampffCache({
            nodeId: node,
            waterBodyId: waterBody.id,
            date: phosphatesData[index].date,
          });
          const url: string = `http://buritaca.invemar.org.co/ICAMWebService/calculate-icam-ae/od/${
            dissolvedOxygenData[index].value
          }/no3/${nitrateData[index].value}/sst/${
            totalSuspendedSolidsData[index].value
          }/ctt/${thermotolerantColiformsData[index].value}/ph/${
            pHData[index].value
          }/po4/${phosphatesData[index].value}/dbo/${
            biochemicalOxygendDemandData[index].value
          }/cla/${chlorophyllAData[index].value}`;
          try {
            // Try to find an icampff cache with the same hash
            await this.icampffCacheRepository
              .findOne(
                {
                  where: {
                    and: [
                      {nodeId: node},
                      {waterBodyId: waterBody.id},
                      {hash: url},
                    ],
                  },
                },
                {strictObjectIDCoercion: true},
              )
              .then(
                async ic => {
                  if (!ic) {
                    // No such icampff cache exists, so a new one will be created
                    let response;
                    let json;
                    for (let attempt = 0; attempt < 5; attempt++) {
                      response = await fetch.default(url);
                      json = await response.json();
                      if (json !== undefined) {
                        break;
                      }
                      console.log(
                        'Error connecting to the api',
                        response,
                        'trying again',
                      );
                    }
                    if (json === undefined) {
                      console.log('Max retry limit reached, try again later.');
                      return;
                    }
                    newIcampffCache.value = json.value;
                    newIcampffCache.hash = url;
                    await this.icampffCacheRepository
                      .create(newIcampffCache)
                      .then(
                        i =>
                          console.log(
                            `Icampff cache ${i.id} with value ${
                              i.value
                            } created.`,
                          ),
                        () =>
                          console.log(
                            'Error creating an icampff cache, cancel and try again.',
                          ),
                      );
                  }
                },
                () => console.log('Error finding icampff-cache'),
              );
          } catch (e) {
            console.log('Error getting the icampff cache, try again.');
            console.log(e);
            return Promise.reject({});
          }
        }
      } // End create icampff cache for each node
    } // End create icampff cache for each node of each water body
    console.log('Icampff cache build process finished');
  }

  /**
   * This is operation allows you to add the values for each
   * parameter that's needed to calculate an ICAMpff for a node,
   * without adding the values of the sensors one by one.
   *
   * @param body Data necessary to calculate an ICAMpff for a WQ node.
   * The values array has the values of each parameter needed to
   * calculate the ICAMpff in the same order as described in the
   * 'variables' constant in this method.
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
  @post('/icampff')
  async newIcampff(@requestBody()
  body: {
    values: number[];
    date: Date;
    nodeId: string;
  }) {
    if (body.values.every(value => value === -1)) {
      console.log(`Icampff for node ${body.nodeId} at ${body.date} ommited`);
      return Promise.resolve({});
    }
    const variables: string[] = [
      'Dissolved Oxygen (DO)',
      'Nitrate (NO3)',
      'Total Suspended Solids (TSS)',
      'Thermotolerant Coliforms',
      'pH',
      'Chrolophyll A (CLA)',
      'Biochemical Oxygen Demand (BOD)',
      'Phosphates (PO4)',
    ];
    let index = 0;
    for (const variable of variables) {
      let nodeData: NodeData | null = await this.nodeDataRepository
        .findOne(
          {where: {and: [{nodeId: body.nodeId}, {variable: variable}]}},
          {strictObjectIDCoercion: true},
        )
        .then(n => n);
      if (nodeData) {
        nodeData.data.push(
          new Datum({
            date: body.date,
            value: `${body.values[index]}`,
          }),
        );
        await this.nodeDataRepository
          .save(nodeData)
          .then(
            () => console.log(`Variable ${variable} saved for ${body.nodeId}.`),
            () =>
              console.log(
                `Error, variable ${variable} was NOT saved for ${body.nodeId}.`,
              ),
          );
      }
      index++;
    }
  }

  /**
   * For every node that belongs to the water body,
   * deletes all the data for the sensors specified by
   * the constant 'variables' in the date provided by
   * the parameter date.
   * @param waterBodyId Id of the water body
   * @param date Date of the ICAMpff to be deleted
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
  @del('/icampff')
  async delIcampff(
    @param.query.string('waterBodyId') waterBodyId: string,
    @param.query.string('date') date: string,
  ) {
    const variables: string[] = [
      'Dissolved Oxygen (DO)',
      'Nitrate (NO3)',
      'Total Suspended Solids (TSS)',
      'Thermotolerant Coliforms',
      'pH',
      'Chrolophyll A (CLA)',
      'Biochemical Oxygen Demand (BOD)',
      'Phosphates (PO4)',
    ];
    let waterBody: WaterBody = await this.waterBodyRepository
      .findById(waterBodyId)
      .then(wb => wb);

    if (waterBody === undefined) {
      return Promise.reject({});
    }

    for (const node of waterBody.nodes) {
      for (const variable of variables) {
        const nodeData: NodeData | null = await this.nodeDataRepository
          .findOne(
            {where: {and: [{nodeId: node}, {variable: variable}]}},
            {strictObjectIDCoercion: true},
          )
          .then(nd => nd);
        if (!nodeData) {
          console.log('Node data not found');
          continue;
        }
        const index = nodeData.data.findIndex(
          datum => new Date(datum.date).toISOString() === date,
        );
        if (index === -1) {
          console.log('Datum not found');
          continue;
        }
        nodeData.data.splice(index, 1);
        await this.nodeDataRepository
          .save(nodeData)
          .then(
            nd => console.log(`${nd.id} is updated`),
            () => console.log(`${nodeData.id} was NOT updated`),
          );
      }
    }
  }

  /**
   * Deletes all ICAMpff caches.
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
  @del('/icampff-caches')
  async delIcampffCaches() {
    return await this.icampffCacheRepository
      .deleteAll()
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }
}
