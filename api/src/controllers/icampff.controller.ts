import {inject} from '@loopback/context';
import {get, param, put, post, del, requestBody} from '@loopback/openapi-v3';
import {
  NodeTypeRepository,
  NodeRepository,
  SensorRepository,
  DatumRepository,
  NodeDataRepository,
  WaterBodyRepository,
  IcampffCacheRepository,
} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {IcampffCache, WaterBody, Datum, NodeData} from '../models';
import * as fetch from 'node-fetch';

export class IcampffController {
  constructor(
    @repository(DatumRepository) public datumRepository: DatumRepository,
    @repository(NodeRepository) public nodeRepository: NodeRepository,
    @repository(NodeTypeRepository)
    public nodeTypeRepository: NodeTypeRepository,
    @repository(SensorRepository) public sensorRepository: SensorRepository,
    @repository(NodeDataRepository)
    public nodeDataRepository: NodeDataRepository,
    @repository(WaterBodyRepository)
    private waterBodyRepository: WaterBodyRepository,
    @repository(IcampffCacheRepository)
    private icampffCacheRepository: IcampffCacheRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

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

  @get('/icampff-avg-caches')
  async getAvgCaches(
    @param.query.string('waterBodyId') waterBodyId: string,
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let icampffCaches: IcampffCache[][] = [];
    let avgs: {date: Date; value: number}[] = [];
    let waterBody: WaterBody = await this.waterBodyRepository.findById(waterBodyId).then(
      wb => wb,
    );

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

    if (pageIndex === undefined && pageSize === undefined) {
      return avgs;
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

  @authenticate('BearerStrategy', {type: -1})
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
          /**
           * console.log(
          node,
          dissolvedOxygenData.length,
          nitrateData.length,
          totalSuspendedSolidsData.length,
          thermotolerantColiformsData.length,
          pHData.length,
          chlorophyllAData.length,
          biochemicalOxygendDemandData.length,
          phosphatesData.length,
        );
           */
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

  @authenticate('BearerStrategy', {type: -1})
  @post('/icampff')
  async newIcampff(@requestBody()
  body: {
    values: number[];
    date: Date;
    nodeId: string;
  }) {
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
      await this.nodeDataRepository
        .findOne(
          {where: {and: [{nodeId: body.nodeId}, {variable: variable}]}},
          {strictObjectIDCoercion: true},
        )
        .then(nodeData => {
          if (nodeData) {
            nodeData.data.push(
              new Datum({
                date: body.date,
                value: `${body.values[index]}`,
              }),
            );
          }
        });
      index++;
    }
  }

  @authenticate('BearerStrategy', {type: -1})
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
          continue;
        }
        const index = nodeData.data.findIndex(
          datum => datum.date.toString() === date,
        );
        if (index === -1) {
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

  @authenticate('BearerStrategy', {type: -1})
  @del('/icampff-caches')
  async delIcampffCaches() {
    return await this.icampffCacheRepository
      .deleteAll()
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }
}
