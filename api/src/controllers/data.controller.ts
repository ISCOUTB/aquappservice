import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {NodeDataRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Datum} from '../models';

export class DataController {
  /**
   * @param nodeDataRepository Node repository
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
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  /**
   * Exports a portion of the data of the node specified by
   * the parameter nodeId, data in the date range start <= date <= end.
   *
   * @param nodeId Id of the node
   * @param variable Sensor
   * @param start Start date
   * @param end end date
   * @param pageIndex Page number, 0 to N
   * @param pageSize Number of elements
   */
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

  /**
   * Delete a datum of a node
   * @param nodeId Id of the node
   * @param variable Sensor
   * @param date date of the datum
   */
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

  /**
   * Creates a new datum
   * @param body New datum
   * @param nodeId Id of the node
   * @param variable Sensor
   */
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

  /**
   * Modifies the properties of a datum of a sensor (specified by the
   * parameter variable) with the date provided by the parameter date.
   * @param body New datum data
   * @param id Id of the node
   * @param date Date of the datum
   * @param variable Sensor
   */
  @authenticate('BearerStrategy', {type: -1})
  @put('/data')
  async editElement(
    @requestBody()
    body: Datum,
    @param.query.string('id') id: string,
    @param.query.string('date') date: string,
    @param.query.string('variable') variable: string,
  ) {
    return await this.nodeDataRepository
      .findOne(
        {where: {and: [{nodeId: id}, {variable: variable}]}},
        {strictObjectIDCoercion: true},
      )
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
