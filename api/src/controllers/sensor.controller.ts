import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {NodeTypeRepository, SensorRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Sensor} from '../models';

export class SensorController {
  /**
   * @param nodeTypeRepository Node type repository
   * @param sensorRepository Sensor repository
   * @param user Information about the currently authenticated
   *  user (if any). This information is provided by the callback function
   *  in the method verifyBearer of the class AuthStrategyProvider in
   *  auth-strategy.provider.ts (the payload of the token).
   *  The second parameter makes it possible to have unprotected methods
   *  like getElemets.
   */
  constructor(
    @repository(NodeTypeRepository)
    public nodeTypeRepository: NodeTypeRepository,
    @repository(SensorRepository) public sensorRepository: SensorRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  /**
   * Get a page of sensors
   * @param nodeTypeId Id of the node type of the sensors
   * @param pageIndex Page number, 0 to N
   * @param pageSize Number of elements
   */
  @get('/sensors')
  async getElements(
    @param.query.string('nodeTypeId') nodeTypeId: string,
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let sensors: Sensor[] = await this.sensorRepository
      .find()
      .then(u => u.filter(r => r.nodeTypeId === nodeTypeId), () => []);

    if (pageIndex === undefined && pageSize === undefined) {
      return sensors;
    }

    return {
      items: sensors.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > sensors.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: sensors.length,
    };
  }

  /**
   * Creates a new sensor
   * @param body New sensor
   */
  @authenticate('BearerStrategy', {type: -1})
  @post('/sensors')
  async newElement(@requestBody() body: Sensor) {
    body.userId = this.user.id;
    return await this.sensorRepository
      .create(new Sensor(body))
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  /**
   * Deletes a sensor by its id
   * @param id Id of the sensor to be deleted
   */
  @authenticate('BearerStrategy', {type: -1})
  @del('/sensors')
  async delElement(@param.query.string('id') id: string) {
    return await this.sensorRepository
      .deleteById(id)
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  /**
   * Replaces all sensor properties with new data,
   * except for its id.
   * @param body New sensor data
   */
  @authenticate('BearerStrategy', {type: -1})
  @put('/sensors')
  async editElement(
    @requestBody()
    body: Sensor,
  ) {
    return await this.sensorRepository.findById(body.id).then(
      sensor => {
        sensor.variable = body.variable ? body.variable : sensor.variable;
        sensor.unit = body.unit ? body.unit : sensor.unit;
        this.sensorRepository.save(sensor);
        return Promise.resolve({});
      },
      () => Promise.reject({}),
    );
  }
}
