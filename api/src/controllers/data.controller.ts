import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {NodeDataRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Datum} from '../models';

export class DataController {
  constructor(
    @repository(NodeDataRepository)
    public nodeDataRepository: NodeDataRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  @get('/data')
  async getElements(
    @param.query.string('nodeId') nodeId: string,
    @param.query.string('variable') variable: string,
    @param.query.date('start') start: Date,
    @param.query.date('end') end: Date,
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let data: Datum[] = await this.nodeDataRepository
      .findOne(
        {where: {and: [{variable: variable}, {nodeId: nodeId}]}},
        {strictObjectIDCoercion: true},
      )
      .then(
        nodeData => {
          if (!nodeData) {
            return [];
          }
          return start && end
            ? nodeData.data.filter(
                datum => start <= datum.date && datum.date <= end,
              )
            : start
            ? nodeData.data.filter(datum => start <= datum.date)
            : end
            ? nodeData.data.filter(datum => datum.date <= end)
            : nodeData.data;
        },
        () => [],
      );

    if (pageIndex === undefined && pageSize === undefined) {
      return data;
    }

    return {
      items: data.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > data.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: data.length,
    };
  }

  @authenticate('BearerStrategy', {type: -1})
  @del('/data')
  async delElement(
    @param.query.string('nodeId') nodeId: string,
    @param.query.string('variable') variable: string,
    @param.query.string('date') date: string,
  ) {
    return await this.nodeDataRepository
      .findOne(
        {where: {and: [{nodeId: nodeId}, {variable: variable}]}},
        {strictObjectIDCoercion: true},
      )
      .then(
        nodeData => {
          if (!nodeData) {
            return Promise.reject({status: 400});
          }
          const index = nodeData.data.findIndex(
            datum => datum.date.toString() === date,
          );
          if (index === -1) {
            return Promise.reject({status: 400});
          }
          nodeData.data.splice(index, 1);
          this.nodeDataRepository.save(nodeData);
          return Promise.resolve({});
        },
        () => Promise.reject({}),
      );
  }

  @authenticate('BearerStrategy', {type: -1})
  @post('/data')
  async addElement(
    @requestBody()
    body: Datum,
    @param.query.string('nodeId') nodeId: string,
    @param.query.string('variable') variable: string,
  ) {
    return await this.nodeDataRepository
      .findOne(
        {where: {and: [{nodeId: nodeId}, {variable: variable}]}},
        {strictObjectIDCoercion: true},
      )
      .then(
        nodeData => {
          if (!nodeData) {
            return Promise.reject({});
          }
          nodeData.data.push(body);
          this.nodeDataRepository.save(nodeData);
          return Promise.resolve({});
        },
        () => Promise.reject({}),
      );
  }

  @authenticate('BearerStrategy', {type: -1})
  @put('/data')
  async editElement(
    @requestBody()
    body: Datum,
    @param.query.string('id') id: string,
    @param.query.string('date') date: string,
  ) {
    return await this.nodeDataRepository
      .findOne({where: {nodeId: id}}, {strictObjectIDCoercion: true})
      .then(
        nodeData => {
          if (!nodeData) {
            return Promise.reject({});
          }
          const index = nodeData.data.findIndex(
            datum => datum.date.toString() === date,
          );
          if (index === -1) {
            return Promise.reject({});
          }
          nodeData.data[index] = new Datum(body);
          this.nodeDataRepository.save(nodeData);
          return Promise.resolve({});
        },
        () => Promise.reject({}),
      );
  }
}
